package com.musicsocial.controller;

import com.musicsocial.domain.Track;
import com.musicsocial.dto.admin.SystemStatsDTO;
import com.musicsocial.dto.admin.UserManagementDTO;
import com.musicsocial.repository.TrackRepository;
import com.musicsocial.service.AdminService;
import com.musicsocial.service.UserPreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminController {
    
    private final AdminService adminService;
    private final UserPreferenceService userPreferenceService;
    private final TrackRepository trackRepository;

    // System Monitoring Endpoints
    @GetMapping("/stats")
    public ResponseEntity<SystemStatsDTO> getSystemStats(@RequestParam Long adminId) {
        adminService.validateAdminAccess(adminId);
        return ResponseEntity.ok(adminService.getSystemStats());
    }

    // User Management Endpoints
    @GetMapping("/users")
    public ResponseEntity<Page<UserManagementDTO>> getAllUsers(
            @RequestParam Long adminId,
            Pageable pageable) {
        adminService.validateAdminAccess(adminId);
        return ResponseEntity.ok(adminService.getAllUsersForAdmin(pageable));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserManagementDTO> getUserDetails(
            @PathVariable Long userId,
            @RequestParam Long adminId) {
        adminService.validateAdminAccess(adminId);
        return ResponseEntity.ok(adminService.getUserDetailsForAdmin(userId));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<String> updateUserRole(
            @PathVariable Long userId,
            @RequestParam String role,
            @RequestParam Long adminId) {
        adminService.validateAdminAccess(adminId);
        adminService.updateUserRole(userId, role);
        return ResponseEntity.ok("User role updated successfully");
    }

    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<String> banUser(
            @PathVariable Long userId,
            @RequestParam String reason,
            @RequestParam Long adminId) {
        adminService.validateAdminAccess(adminId);
        adminService.banUser(userId, reason, adminId);
        return ResponseEntity.ok("User banned successfully");
    }

    @PostMapping("/users/{userId}/unban")
    public ResponseEntity<String> unbanUser(
            @PathVariable Long userId,
            @RequestParam Long adminId) {
        adminService.validateAdminAccess(adminId);
        adminService.unbanUser(userId, adminId);
        return ResponseEntity.ok("User unbanned successfully");
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long userId,
            @RequestParam Long adminId) {
        adminService.validateAdminAccess(adminId);
        adminService.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully");
    }

    // Content Management Endpoints
    @DeleteMapping("/tracks/{trackId}")
    public ResponseEntity<String> deleteTrack(
            @PathVariable Long trackId,
            @RequestParam Long adminId) {
        adminService.validateAdminAccess(adminId);
        adminService.deleteTrackAsAdmin(trackId, adminId);
        return ResponseEntity.ok("Track deleted successfully");
    }

    @DeleteMapping("/playlists/{playlistId}")
    public ResponseEntity<String> deletePlaylist(
            @PathVariable Long playlistId,
            @RequestParam Long adminId) {
        adminService.validateAdminAccess(adminId);
        adminService.deletePlaylistAsAdmin(playlistId, adminId);
        return ResponseEntity.ok("Playlist deleted successfully");
    }

    // Legacy endpoints (keeping for backward compatibility)
    @PostMapping("/update-genres")
    public ResponseEntity<?> updateTrackGenres(@RequestParam Long adminId) {
        adminService.validateAdminAccess(adminId);
        log.info("Admin {} starting manual genre update for tracks", adminId);
        
        try {
            // Create artist-genre mapping (same as in UserPreferenceServiceImpl)
            Map<String, String> artistToGenre = new HashMap<>();
            artistToGenre.put("Jahzzar", "electronic");
            artistToGenre.put("Stefan Kartenberg", "jazz");
            artistToGenre.put("SnakesArt", "ambient");
            artistToGenre.put("BrainControl", "rock");
            artistToGenre.put("PKRZ", "electronic");
            artistToGenre.put("Wally", "pop");
            artistToGenre.put("Bralitz", "electronic");
            artistToGenre.put("Skala", "electronic");
            artistToGenre.put("Chris Zabriskie", "ambient");
            artistToGenre.put("Kevin MacLeod", "classical");
            artistToGenre.put("Airtone", "electronic");
            artistToGenre.put("Ehma", "ambient");
            artistToGenre.put("Kai Engel", "classical");
            artistToGenre.put("Broke For Free", "electronic");
            artistToGenre.put("Podington Bear", "folk");
            artistToGenre.put("BoxCat Games", "electronic");
            artistToGenre.put("Monplaisir", "jazz");
            artistToGenre.put("Anitek", "electronic");
            artistToGenre.put("Loyalty Freak Music", "electronic");
            artistToGenre.put("Ketsa", "electronic");
            
            // Get all tracks without genre
            var tracksWithoutGenre = trackRepository.findAll().stream()
                    .filter(track -> track.getGenre() == null || track.getGenre().trim().isEmpty())
                    .toList();
            
            log.info("Found {} tracks without genre", tracksWithoutGenre.size());
            log.info("Using artist-genre mapping with {} entries", artistToGenre.size());
            
            int updatedCount = 0;
            Map<String, Integer> genreStats = new HashMap<>();
            
            for (Track track : tracksWithoutGenre) {
                String artist = track.getArtist();
                if (artist != null && artistToGenre.containsKey(artist)) {
                    String mappedGenre = artistToGenre.get(artist);
                    track.setGenre(mappedGenre);
                    trackRepository.save(track);
                    updatedCount++;
                    
                    genreStats.put(mappedGenre, genreStats.getOrDefault(mappedGenre, 0) + 1);
                    log.info("Updated track '{}' by '{}' with genre '{}'", track.getTitle(), artist, mappedGenre);
                }
            }
            
            log.info("Genre update completed. Updated {} tracks", updatedCount);
            log.info("Genre distribution: {}", genreStats);
            
            return ResponseEntity.ok(Map.of(
                "message", "Genre update completed using artist-genre mapping",
                "tracksUpdated", updatedCount,
                "totalTracksWithoutGenre", tracksWithoutGenre.size(),
                "genreDistribution", genreStats,
                "artistGenreMapping", artistToGenre
            ));
            
        } catch (Exception e) {
            log.error("Error updating track genres", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/update-user-preferences")
    public ResponseEntity<String> updateUserPreferences(
            @RequestParam Long userId,
            @RequestParam Long adminId) {
        adminService.validateAdminAccess(adminId);
        userPreferenceService.updatePreferencesFromListeningHistory(userId);
        return ResponseEntity.ok("User preferences updated successfully");
    }

    // Utility endpoint to check admin status
    @GetMapping("/check-access/{userId}")
    public ResponseEntity<Map<String, Boolean>> checkAdminAccess(@PathVariable Long userId) {
        boolean isAdmin = adminService.isAdmin(userId);
        return ResponseEntity.ok(Map.of("isAdmin", isAdmin));
    }
} 