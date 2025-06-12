package com.musicsocial.controller;

import com.musicsocial.dto.playlist.PlaylistDTO;
import com.musicsocial.dto.playlist.PlaylistCreateDTO;
import com.musicsocial.dto.playlist.PlaylistUpdateDTO;
import com.musicsocial.service.PlaylistService;
import com.musicsocial.service.NotificationService;
import com.musicsocial.dto.notification.NotificationCreateDTO;
import com.musicsocial.domain.User;
import com.musicsocial.domain.Playlist;
import com.musicsocial.repository.UserRepository;
import com.musicsocial.repository.PlaylistRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/playlists")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@Slf4j
public class PlaylistController {
    private final PlaylistService playlistService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final PlaylistRepository playlistRepository;

    @GetMapping("/{id}")
    public ResponseEntity<PlaylistDTO> getPlaylistById(@PathVariable Long id) {
        return ResponseEntity.ok(playlistService.getPlaylistById(id));
    }

    @GetMapping
    public ResponseEntity<Page<PlaylistDTO>> getAllPlaylists(Pageable pageable) {
        return ResponseEntity.ok(playlistService.getAllPlaylists(pageable));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<Page<PlaylistDTO>> getPlaylistsByUser(@PathVariable String username, Pageable pageable) {
        return ResponseEntity.ok(playlistService.getPlaylistsByUser(username, pageable));
    }

    @PostMapping
    public ResponseEntity<PlaylistDTO> createPlaylist(@RequestBody PlaylistCreateDTO playlistCreateDTO) {
        return ResponseEntity.ok(playlistService.createPlaylist(playlistCreateDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlaylistDTO> updatePlaylist(@PathVariable Long id, @RequestBody PlaylistUpdateDTO playlistUpdateDTO) {
        return ResponseEntity.ok(playlistService.updatePlaylist(id, playlistUpdateDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlaylist(@PathVariable Long id) {
        playlistService.deletePlaylist(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{playlistId}/tracks/{trackId}")
    public ResponseEntity<Void> addTrackToPlaylist(
            @PathVariable Long playlistId,
            @PathVariable Long trackId) {
        playlistService.addTrackToPlaylist(playlistId, trackId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{playlistId}/tracks/{trackId}")
    public ResponseEntity<Void> removeTrackFromPlaylist(
            @PathVariable Long playlistId,
            @PathVariable Long trackId) {
        playlistService.removeTrackFromPlaylist(playlistId, trackId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{playlistId}/like/{userId}")
    public ResponseEntity<Void> likePlaylist(
            @PathVariable Long userId,
            @PathVariable Long playlistId) {
        playlistService.likePlaylist(userId, playlistId);
        
        // Send notification to playlist owner
        try {
            User user = userRepository.findById(userId).orElse(null);
            Playlist playlist = playlistRepository.findById(playlistId).orElse(null);
            
            if (user != null && playlist != null && !userId.equals(playlist.getUser().getId())) {
                NotificationCreateDTO notificationDTO = NotificationCreateDTO.builder()
                        .senderId(userId)
                        .receiverId(playlist.getUser().getId())
                        .message(user.getUsername() + " liked your playlist \"" + playlist.getName() + "\"")
                        .type("LIKE")
                        .itemType("playlist")
                        .itemId(playlistId)
                        .build();
                notificationService.createNotification(notificationDTO);
            }
        } catch (Exception e) {
            log.warn("Failed to send playlist like notification: {}", e.getMessage());
        }
        
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{playlistId}/like/{userId}")
    public ResponseEntity<Void> unlikePlaylist(
            @PathVariable Long userId,
            @PathVariable Long playlistId) {
        playlistService.unlikePlaylist(userId, playlistId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{playlistId}/play")
    public ResponseEntity<Void> incrementPlayCount(@PathVariable Long playlistId) {
        playlistService.incrementPlayCount(playlistId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PlaylistDTO>> searchPlaylists(
            @RequestParam String query,
            Pageable pageable) {
        return ResponseEntity.ok(playlistService.searchPlaylists(query, pageable));
    }

    @GetMapping("/public")
    public ResponseEntity<Page<PlaylistDTO>> getPublicPlaylists(Pageable pageable) {
        return ResponseEntity.ok(playlistService.getPublicPlaylists(pageable));
    }

    @GetMapping("/most-played")
    public ResponseEntity<Page<PlaylistDTO>> getMostPlayedPlaylists(Pageable pageable) {
        return ResponseEntity.ok(playlistService.getMostPlayedPlaylists(pageable));
    }
} 