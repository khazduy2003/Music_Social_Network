package com.musicsocial.service.impl;

import com.musicsocial.domain.Track;
import com.musicsocial.domain.User;
import com.musicsocial.dto.notification.NotificationCreateDTO;
import com.musicsocial.dto.track.TrackCreateDTO;
import com.musicsocial.dto.track.TrackDTO;
import com.musicsocial.dto.track.TrackUpdateDTO;
import com.musicsocial.exception.ResourceNotFoundException;
import com.musicsocial.mapper.TrackMapper;
import com.musicsocial.repository.ListeningHistoryRepository;
import com.musicsocial.repository.TrackRepository;
import com.musicsocial.repository.UserRepository;
import com.musicsocial.service.FileStorageService;
import com.musicsocial.service.ListeningHistoryService;
import com.musicsocial.service.NotificationService;
import com.musicsocial.service.TrackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TrackServiceImpl implements TrackService {

    private final TrackRepository trackRepository;
    private final UserRepository userRepository;
    private final TrackMapper trackMapper;
    private final ListeningHistoryService listeningHistoryService;
    private final ListeningHistoryRepository listeningHistoryRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    @Override
    public TrackDTO createTrack(TrackCreateDTO trackCreateDTO) {
        Track track = trackMapper.toEntity(trackCreateDTO);
        track.setPlayCount(0);
        return trackMapper.toDTO(trackRepository.save(track), null);
    }

    @Override
    public TrackDTO uploadTrack(String title, String artist, String album, String genre, String description,
                               MultipartFile audioFile, MultipartFile coverImage, Long userId) {
        try {
            // Get user
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

            // Save files and get URLs
            String audioUrl = null;
            String coverImageUrl = null;

            if (audioFile != null && !audioFile.isEmpty()) {
                audioUrl = fileStorageService.storeAudioFile(audioFile, userId);
            }

            if (coverImage != null && !coverImage.isEmpty()) {
                coverImageUrl = fileStorageService.storeImageFile(coverImage, userId);
            }

            // Create track entity
            Track track = new Track();
            track.setTitle(title);
            track.setArtist(artist);
            track.setAlbum(album);
            track.setGenre(genre);
            track.setAudioUrl(audioUrl);
            track.setCoverImageUrl(coverImageUrl);
            track.setUser(user);
            track.setPlayCount(0);

            // Save and return DTO
            Track savedTrack = trackRepository.save(track);
            return trackMapper.toDTO(savedTrack, userId);

        } catch (Exception e) {
            log.error("Error creating track", e);
            throw new RuntimeException("Failed to create track", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public TrackDTO getTrackById(Long id, Long userId) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found with id: " + id));
        return trackMapper.toDTO(track, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public TrackDTO getTrackById(Long id) {
        return getTrackById(id, null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TrackDTO> getAllTracks(Pageable pageable, Long userId) {
        return trackRepository.findAll(pageable)
                .map(track -> trackMapper.toDTO(track, userId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TrackDTO> getAllTracks(Pageable pageable) {
        return getAllTracks(pageable, null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TrackDTO> getTracksByUser(String username, Pageable pageable, Long userId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return trackRepository.findByUserUsername(username, pageable)
                .map(track -> trackMapper.toDTO(track, userId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TrackDTO> getTracksByUser(String username, Pageable pageable) {
        return getTracksByUser(username, pageable, null);
    }

    @Override
    public TrackDTO updateTrack(Long id, TrackUpdateDTO trackUpdateDTO, Long userId) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found with id: " + id));
        
        trackMapper.updateEntityFromDTO(trackUpdateDTO, track);
        return trackMapper.toDTO(trackRepository.save(track), userId);
    }

    @Override
    public TrackDTO updateTrack(Long id, TrackUpdateDTO trackUpdateDTO) {
        return updateTrack(id, trackUpdateDTO, null);
    }

    @Override
    public void deleteTrack(Long id) {
        if (!trackRepository.existsById(id)) {
            throw new ResourceNotFoundException("Track not found with id: " + id);
        }
        trackRepository.deleteById(id);
    }

    @Override
    public void likeTrack(Long userId, Long trackId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found with id: " + trackId));

        user.getLikedTracks().add(track);
        userRepository.save(user);
        
        // Send notification to track owner (if not liking own track and track has an owner)
        if (track.getUser() != null && !userId.equals(track.getUser().getId())) {
            try {
                NotificationCreateDTO notificationDTO = NotificationCreateDTO.builder()
                        .senderId(userId)
                        .receiverId(track.getUser().getId())
                        .message(user.getUsername() + " liked your track \"" + track.getTitle() + "\"")
                        .type("LIKE")
                        .itemType("track")
                        .itemId(trackId)
                        .build();
                notificationService.createNotification(notificationDTO);
            } catch (Exception e) {
                log.warn("Failed to send track like notification from {} to {} for track {}: {}", 
                    userId, track.getUser().getId(), trackId, e.getMessage());
            }
        }
    }

    @Override
    public void unlikeTrack(Long userId, Long trackId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found with id: " + trackId));

        user.getLikedTracks().remove(track);
        userRepository.save(user);
    }

    @Override
    public void incrementPlayCount(Long trackId) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found with id: " + trackId));
        
        track.setPlayCount(track.getPlayCount() + 1);
        trackRepository.save(track);

        // Save to listening history if user is logged in
        if (track.getUser() != null) {
            // We pass the full duration of the track, but the ListeningHistoryService
            // will check if the actual listened duration meets the minimum threshold
            listeningHistoryService.addToHistory(track.getUser().getId(), trackId, track.getDuration());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TrackDTO> searchTracks(String query, Pageable pageable, Long userId) {
        return trackRepository.search(query, pageable)
                .map(track -> trackMapper.toDTO(track, userId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TrackDTO> searchTracks(String query, Pageable pageable) {
        return searchTracks(query, pageable, null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TrackDTO> getTracksByGenre(String genre, Pageable pageable, Long userId) {
        return trackRepository.findByGenre(genre, pageable)
                .map(track -> trackMapper.toDTO(track, userId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TrackDTO> getTracksByGenre(String genre, Pageable pageable) {
        return getTracksByGenre(genre, pageable, null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TrackDTO> getMostPlayedTracks(Long userId, Pageable pageable) {
        return trackRepository.findMostPlayed(pageable)
                .map(track -> trackMapper.toDTO(track, userId));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TrackDTO> getTopRatedTracks(Long userId, Pageable pageable) {
        return trackRepository.findMostPlayed(pageable)
                .map(track -> trackMapper.toDTO(track, userId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrackDTO> getLikedTracks(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return user.getLikedTracks().stream()
                .map(track -> trackMapper.toDTO(track, userId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TrackDTO> getTracksLikedByFollowing(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Get the users that the current user is following
        Set<User> followingUsers = user.getFollowing();
        
        // Get all the track IDs liked by users that the current user follows
        Set<Long> trackIds = followingUsers.stream()
                .flatMap(followedUser -> followedUser.getLikedTracks().stream())
                .map(Track::getId)
                .collect(Collectors.toSet());
        
        // Fetch the tracks with pagination
        return trackRepository.findByIdIn(trackIds, pageable)
                .map(track -> trackMapper.toDTO(track, userId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrackDTO> getAllTracksForDiscover(Long userId) {
        // Lấy tất cả tracks từ database, sắp xếp theo title từ A-Z
        List<Track> allTracks = trackRepository.findAll(Sort.by(Sort.Direction.ASC, "title"));
        
        return allTracks.stream()
                .map(track -> trackMapper.toDTO(track, userId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long getTotalPlayCountFromHistory(Long trackId) {
        return listeningHistoryRepository.getTotalPlayCountByTrackId(trackId);
    }
} 