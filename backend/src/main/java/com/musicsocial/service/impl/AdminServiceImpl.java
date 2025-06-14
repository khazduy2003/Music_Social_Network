package com.musicsocial.service.impl;

import com.musicsocial.domain.User;
import com.musicsocial.domain.Track;
import com.musicsocial.dto.admin.SystemStatsDTO;
import com.musicsocial.dto.admin.UserManagementDTO;
import com.musicsocial.exception.ResourceNotFoundException;
import com.musicsocial.repository.*;
import com.musicsocial.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final TrackRepository trackRepository;
    private final PlaylistRepository playlistRepository;
    private final ListeningHistoryRepository listeningHistoryRepository;

    @Override
    @Transactional(readOnly = true)
    public SystemStatsDTO getSystemStats() {
        log.info("Generating system statistics for admin dashboard");
        
        // Basic counts
        Long totalUsers = userRepository.count();
        Long totalTracks = trackRepository.count();
        Long totalPlaylists = playlistRepository.count();
        Long totalListeningHistory = listeningHistoryRepository.count();
        
        // Recent activity (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        Long newUsersThisWeek = userRepository.countByCreatedAtAfter(weekAgo);
        Long newTracksThisWeek = trackRepository.countByCreatedAtAfter(weekAgo);
        Long newPlaylistsThisWeek = playlistRepository.countByCreatedAtAfter(weekAgo);
        
        // Top tracks by play count from listening history
        List<SystemStatsDTO.TopItemDTO> topTracks = trackRepository.findTopTracksByPlayCount()
                .stream()
                .limit(10)
                .map(result -> {
                    Object[] row = (Object[]) result;
                    Track track = (Track) row[0];
                    Long totalPlays = ((Number) row[1]).longValue();
                    return SystemStatsDTO.TopItemDTO.builder()
                            .name(track.getTitle())
                            .count(totalPlays)
                            .additionalInfo(track.getArtist())
                            .build();
                })
                .collect(Collectors.toList());
        
        // Top artists by total plays from listening history
        List<SystemStatsDTO.TopItemDTO> topArtists = trackRepository.findTopArtistsByTotalPlays()
                .stream()
                .limit(10)
                .map(result -> {
                    Object[] row = (Object[]) result;
                    return SystemStatsDTO.TopItemDTO.builder()
                            .name((String) row[0]) // artist name
                            .count(((Number) row[1]).longValue()) // total plays from listening history
                            .additionalInfo(((Number) row[2]).longValue() + " tracks") // track count
                            .build();
                })
                .collect(Collectors.toList());
        
        // Top genres by track count (including "No Genre")
        List<SystemStatsDTO.TopItemDTO> topGenres = trackRepository.findTopGenresByTrackCount()
                .stream()
                .limit(10)
                .map(result -> {
                    Object[] row = (Object[]) result;
                    return SystemStatsDTO.TopItemDTO.builder()
                            .name((String) row[0]) // genre name (including "No Genre")
                            .count(((Number) row[1]).longValue()) // track count
                            .additionalInfo(null)
                            .build();
                })
                .collect(Collectors.toList());
        
        // Top users by activity
        List<SystemStatsDTO.UserStatsDTO> topUsers = userRepository.findTopUsersByActivity()
                .stream()
                .limit(10)
                .map(user -> SystemStatsDTO.UserStatsDTO.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .tracksCount((long) user.getTracks().size())
                        .playlistsCount((long) user.getPlaylists().size())
                        .followersCount((long) user.getFollowers().size())
                        .role(user.getRole())
                        .build())
                .collect(Collectors.toList());
        
        return SystemStatsDTO.builder()
                .totalUsers(totalUsers)
                .totalTracks(totalTracks)
                .totalPlaylists(totalPlaylists)
                .totalListeningHistory(totalListeningHistory)
                .newUsersThisWeek(newUsersThisWeek)
                .newTracksThisWeek(newTracksThisWeek)
                .newPlaylistsThisWeek(newPlaylistsThisWeek)
                .topTracks(topTracks)
                .topArtists(topArtists)
                .topGenres(topGenres)
                .topUsers(topUsers)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserManagementDTO> getAllUsersForAdmin(Pageable pageable) {
        Page<User> users = userRepository.findAll(pageable);
        
        List<UserManagementDTO> userDTOs = users.getContent().stream()
                .map(this::convertToUserManagementDTO)
                .collect(Collectors.toList());
        
        return new PageImpl<>(userDTOs, pageable, users.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public UserManagementDTO getUserDetailsForAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return convertToUserManagementDTO(user);
    }

    @Override
    @Transactional
    public void updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        log.info("Updating user {} role from {} to {}", user.getUsername(), user.getRole(), role);
        user.setRole(role);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void banUser(Long userId, String reason, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found with id: " + adminId));
        
        validateAdminAccess(adminId);
        
        user.setBanReason(reason);
        user.setBannedAt(LocalDateTime.now());
        user.setBannedBy(admin.getUsername());
        userRepository.save(user);
        
        log.info("Admin {} banning user {} for reason: {}", admin.getUsername(), user.getUsername(), reason);
    }

    @Override
    @Transactional
    public void unbanUser(Long userId, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        validateAdminAccess(adminId);
        
        user.setBanReason(null);
        user.setBannedAt(null);
        user.setBannedBy(null);
        userRepository.save(user);
        
        log.info("Admin {} unbanning user {}", adminId, user.getUsername());
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        
        log.info("Admin deleting user with id: {}", userId);
        User user = userRepository.findById(userId).orElseThrow();
        
        // Delete related listening history first
        listeningHistoryRepository.deleteByUserId(userId);
        
        userRepository.delete(user);
    }

    @Override
    @Transactional
    public void deleteTrackAsAdmin(Long trackId, Long adminId) {
        validateAdminAccess(adminId);
        
        if (!trackRepository.existsById(trackId)) {
            throw new ResourceNotFoundException("Track not found with id: " + trackId);
        }
        
        log.info("Admin {} deleting track with id: {}", adminId, trackId);
        Track track = trackRepository.findById(trackId).orElseThrow();
        trackRepository.delete(track);
    }

    @Override
    @Transactional
    public void deletePlaylistAsAdmin(Long playlistId, Long adminId) {
        validateAdminAccess(adminId);
        
        if (!playlistRepository.existsById(playlistId)) {
            throw new ResourceNotFoundException("Playlist not found with id: " + playlistId);
        }
        
        log.info("Admin {} deleting playlist with id: {}", adminId, playlistId);
        playlistRepository.deleteById(playlistId);
    }

    @Override
    public boolean isAdmin(Long userId) {
        return userRepository.findById(userId)
                .map(user -> "ADMIN".equals(user.getRole()))
                .orElse(false);
    }

    @Override
    public void validateAdminAccess(Long userId) {
        if (!isAdmin(userId)) {
            throw new SecurityException("Access denied. Admin privileges required.");
        }
    }

    private UserManagementDTO convertToUserManagementDTO(User user) {
        // Calculate total listening time
        Long totalListeningTime = listeningHistoryRepository.getTotalListeningTimeByUserId(user.getId());
        
        return UserManagementDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .isActive(!"BANNED".equals(user.getRole()))
                .createdAt(user.getCreatedAt())
                .tracksCount((long) user.getTracks().size())
                .playlistsCount((long) user.getPlaylists().size())
                .followersCount((long) user.getFollowers().size())
                .followingCount((long) user.getFollowing().size())
                .totalListeningTime(totalListeningTime != null ? totalListeningTime : 0L)
                .build();
    }
} 