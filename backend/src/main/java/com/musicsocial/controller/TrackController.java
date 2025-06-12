package com.musicsocial.controller;

import com.musicsocial.dto.track.TrackDTO;
import com.musicsocial.dto.track.TrackCreateDTO;
import com.musicsocial.dto.track.TrackUpdateDTO;
import com.musicsocial.service.TrackService;
import com.musicsocial.scheduler.JamendoDataScheduler;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import com.musicsocial.service.ListeningHistoryService;
import com.musicsocial.service.NotificationService;
import com.musicsocial.dto.notification.NotificationCreateDTO;
import com.musicsocial.domain.Track;
import com.musicsocial.domain.User;
import com.musicsocial.repository.TrackRepository;
import com.musicsocial.repository.UserRepository;

@RestController
@RequestMapping("/api/tracks")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class TrackController {
    private final TrackService trackService;
    private final JamendoDataScheduler jamendoDataScheduler;
    private final ListeningHistoryService listeningHistoryService;
    private final NotificationService notificationService;
    private final TrackRepository trackRepository;
    private final UserRepository userRepository;
    @Autowired
    private RestTemplate restTemplate;
    private static final Logger log = LoggerFactory.getLogger(TrackController.class);

    @GetMapping("/{id}")
    public ResponseEntity<TrackDTO> getTrackById(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(userId != null ? 
            trackService.getTrackById(id, userId) : 
            trackService.getTrackById(id));
    }

    @GetMapping
    public ResponseEntity<Page<TrackDTO>> getAllTracks(
            Pageable pageable,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(userId != null ? 
            trackService.getAllTracks(pageable, userId) : 
            trackService.getAllTracks(pageable));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<Page<TrackDTO>> getTracksByUser(
            @PathVariable String username,
            Pageable pageable,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(userId != null ? 
            trackService.getTracksByUser(username, pageable, userId) : 
            trackService.getTracksByUser(username, pageable));
    }

    @PostMapping
    public ResponseEntity<TrackDTO> createTrack(@RequestBody TrackCreateDTO trackCreateDTO) {
        return ResponseEntity.ok(trackService.createTrack(trackCreateDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TrackDTO> updateTrack(
            @PathVariable Long id,
            @RequestBody TrackUpdateDTO trackUpdateDTO,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(userId != null ? 
            trackService.updateTrack(id, trackUpdateDTO, userId) : 
            trackService.updateTrack(id, trackUpdateDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrack(@PathVariable Long id) {
        trackService.deleteTrack(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{trackId}/like/{userId}")
    public ResponseEntity<Void> likeTrack(@PathVariable Long userId, @PathVariable Long trackId) {
        trackService.likeTrack(userId, trackId);
        
        // Send notification to track owner
        try {
            User user = userRepository.findById(userId).orElse(null);
            Track track = trackRepository.findById(trackId).orElse(null);
            
            if (user != null && track != null && !userId.equals(track.getUser().getId())) {
                NotificationCreateDTO notificationDTO = NotificationCreateDTO.builder()
                        .senderId(userId)
                        .receiverId(track.getUser().getId())
                        .message(user.getUsername() + " liked your track \"" + track.getTitle() + "\"")
                        .type("LIKE")
                        .itemType("track")
                        .itemId(trackId)
                        .build();
                notificationService.createNotification(notificationDTO);
            }
        } catch (Exception e) {
            log.warn("Failed to send track like notification: {}", e.getMessage());
        }
        
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{trackId}/like/{userId}")
    public ResponseEntity<Void> unlikeTrack(@PathVariable Long userId, @PathVariable Long trackId) {
        trackService.unlikeTrack(userId, trackId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{trackId}/rate/{userId}")
    public ResponseEntity<Void> rateTrack(
            @PathVariable Long userId,
            @PathVariable Long trackId,
            @RequestParam Double rating) {
        trackService.rateTrack(userId, trackId, rating);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{trackId}/play")
    public ResponseEntity<Void> incrementPlayCount(
            @PathVariable Long trackId,
            @RequestParam(required = false) Integer listenedDuration,
            @RequestParam(required = false) Long userId) {
        
        // If userId is provided, use it for the listening history
        // Otherwise, the service will use the track's user id
        if (userId != null && listenedDuration != null) {
            // Add to listening history with actual listened duration
            listeningHistoryService.addToHistory(userId, trackId, listenedDuration);
        } else {
            // Use the default implementation which uses track's full duration
            trackService.incrementPlayCount(trackId);
        }
        
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<TrackDTO>> searchTracks(
            @RequestParam String query,
            Pageable pageable,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(userId != null ? 
            trackService.searchTracks(query, pageable, userId) : 
            trackService.searchTracks(query, pageable));
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<Page<TrackDTO>> getTracksByGenre(
            @PathVariable String genre,
            Pageable pageable,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(userId != null ? 
            trackService.getTracksByGenre(genre, pageable, userId) : 
            trackService.getTracksByGenre(genre, pageable));
    }

    @GetMapping("/most-played")
    public ResponseEntity<Page<TrackDTO>> getMostPlayedTracks(
            @RequestParam(required = false) Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(trackService.getMostPlayedTracks(userId, pageable));
    }

    @GetMapping("/top-rated")
    public ResponseEntity<Page<TrackDTO>> getTopRatedTracks(
            @RequestParam(required = false) Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(trackService.getTopRatedTracks(userId, pageable));
    }

    @PostMapping("/sync-jamendo")
    @ResponseBody
    public ResponseEntity<String> syncJamendoData() {
        try {
            jamendoDataScheduler.fetchAndUpdateJamendoData();
            return ResponseEntity.ok("Sync completed successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Sync failed: " + e.getMessage());
        }
    }

    @GetMapping("/liked/{userId}")
    public ResponseEntity<List<TrackDTO>> getLikedTracks(@PathVariable Long userId) {
        return ResponseEntity.ok(trackService.getLikedTracks(userId));
    }

    @GetMapping("/liked-by-following")
    public ResponseEntity<Page<TrackDTO>> getTracksLikedByFollowing(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir,
            @RequestParam Long userId) {
        Pageable pageable = PageRequest.of(
            page, 
            size, 
            Sort.Direction.fromString(sortDir), 
            sortBy
        );
        return ResponseEntity.ok(trackService.getTracksLikedByFollowing(userId, pageable));
    }

    @GetMapping("/{id}/stream")
    public ResponseEntity<byte[]> streamAudio(@PathVariable Long id) {
        try {
            TrackDTO track = trackService.getTrackById(id);
            if (track == null || track.getAudioUrl() == null) {
                return ResponseEntity.notFound().build();
            }

            byte[] audioData = restTemplate.getForObject(track.getAudioUrl(), byte[].class);
            if (audioData == null) {
                return ResponseEntity.notFound().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("inline", "audio.mp3");

            return new ResponseEntity<>(audioData, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<TrackDTO> uploadTrack(
            @RequestParam("title") String title,
            @RequestParam("artist") String artist,
            @RequestParam(value = "album", required = false, defaultValue = "") String album,
            @RequestParam(value = "genre", required = false, defaultValue = "Other") String genre,
            @RequestParam(value = "description", required = false, defaultValue = "") String description,
            @RequestParam("audioFile") MultipartFile audioFile,
            @RequestParam(value = "coverImage", required = false) MultipartFile coverImage,
            @RequestParam("userId") Long userId) {
        
        try {
            TrackDTO uploadedTrack = trackService.uploadTrack(
                title, artist, album, genre, description, audioFile, coverImage, userId);
            return ResponseEntity.ok(uploadedTrack);
        } catch (Exception e) {
            log.error("Error uploading track", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/all-for-discover")
    public ResponseEntity<List<TrackDTO>> getAllTracksForDiscover(
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(trackService.getAllTracksForDiscover(userId));
    }

    private Long getCurrentUserId() {
        // TODO: Implement getting current user ID from security context
        return 1L; // Temporary hardcoded value for testing
    }
} 