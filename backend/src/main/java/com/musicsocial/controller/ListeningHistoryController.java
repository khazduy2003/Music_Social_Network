package com.musicsocial.controller;

import com.musicsocial.domain.ListeningHistory;
import com.musicsocial.dto.history.ListeningHistoryDTO;
import com.musicsocial.service.ListeningHistoryService;
import com.musicsocial.repository.ListeningHistoryRepository;
import com.musicsocial.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Objects;

@Slf4j
@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
@Tag(name = "Listening History", description = "Listening history management APIs")
public class ListeningHistoryController {

    private final ListeningHistoryService listeningHistoryService;
    private final ListeningHistoryRepository listeningHistoryRepository;

    @PostMapping("/{userId}/tracks/{trackId}")
    @Operation(summary = "Add track to user's listening history")
    public ResponseEntity<?> addToHistory(
            @PathVariable Long userId,
            @PathVariable Long trackId,
            @RequestParam Integer duration) {
        try {
            log.info("=== LISTENING HISTORY DEBUG ===");
            log.info("Received request to add to history - userId: {}, trackId: {}, duration: {}", 
                    userId, trackId, duration);
            log.info("Request path variables: userId={}, trackId={}", userId, trackId);
            log.info("Request parameters: duration={}", duration);
            log.info("================================");
            
            if (duration == null || duration <= 0) {
                log.error("Invalid duration: {}", duration);
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Duration must be greater than 0"));
            }
            
            ListeningHistoryDTO history = listeningHistoryService.addToHistory(userId, trackId, duration);
            
            log.info("Successfully added to history: {}", history);
            return ResponseEntity.ok(history);
        } catch (ResourceNotFoundException e) {
            log.error("Resource not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.error("Invalid argument: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error adding to history: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add to history: " + e.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get user's listening history")
    public ResponseEntity<Page<ListeningHistoryDTO>> getUserHistory(
            @PathVariable Long userId,
            Pageable pageable) {
        try {
            log.info("Getting history for user: {} with page: {}", userId, pageable);
            Page<ListeningHistoryDTO> history = listeningHistoryService.getUserHistory(userId, pageable);
            log.info("Found {} history entries for user {}", history.getTotalElements(), userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("Error getting user history: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/{userId}/most-listened")
    @Operation(summary = "Get user's most listened tracks")
    public ResponseEntity<List<Object[]>> getMostListenedTracks(
            @PathVariable Long userId,
            Pageable pageable) {
        try {
            log.info("Getting most listened tracks for user: {} with page: {}", userId, pageable);
            List<Object[]> tracks = listeningHistoryService.getMostListenedTracks(userId, pageable);
            log.info("Found {} most listened tracks for user {}", tracks.size(), userId);
            return ResponseEntity.ok(tracks);
        } catch (Exception e) {
            log.error("Error getting most listened tracks: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/{userId}/recent")
    @Operation(summary = "Get user's recently listened tracks")
    public ResponseEntity<Page<Object[]>> getRecentTracks(
            @PathVariable Long userId,
            Pageable pageable) {
        try {
            log.info("Getting recent tracks for user: {} with page: {}", userId, pageable);
            Page<Object[]> tracks = listeningHistoryService.getRecentTracks(userId, pageable);
            log.info("Found {} recent tracks for user {}", tracks.getTotalElements(), userId);
            return ResponseEntity.ok(tracks);
        } catch (Exception e) {
            log.error("Error getting recent tracks: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/user/{userId}/qualified-for-recommendations")
    @Operation(summary = "Get listening history qualified for recommendations (duration > 30s)")
    public ResponseEntity<?> getQualifiedListeningHistory(@PathVariable Long userId) {
        try {
            // Get all listening history for user with duration > 30s
            List<ListeningHistory> qualifiedHistory = listeningHistoryRepository
                    .findByUserIdAndDurationGreaterThanOrderByCreatedAtDesc(userId, 30);
            
            if (qualifiedHistory.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "message", "No listening history found with duration > 30s",
                    "count", 0,
                    "recommendations", "Will show fallback tracks"
                ));
            }
            
            // Extract artists and genres from qualified listening
            Set<String> listenedArtists = qualifiedHistory.stream()
                    .map(lh -> lh.getTrack().getArtist())
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            
            Set<String> listenedGenres = qualifiedHistory.stream()
                    .map(lh -> lh.getTrack().getGenre())
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            
            return ResponseEntity.ok(Map.of(
                "message", "Found qualified listening history for recommendations",
                "count", qualifiedHistory.size(),
                "listenedArtists", listenedArtists,
                "listenedGenres", listenedGenres,
                "history", qualifiedHistory.stream()
                        .map(lh -> Map.of(
                            "trackTitle", lh.getTrack().getTitle(),
                            "artist", lh.getTrack().getArtist(),
                            "genre", lh.getTrack().getGenre(),
                            "duration", lh.getDuration() + "s",
                            "playedAt", lh.getPlayedAt()
                        ))
                        .collect(Collectors.toList())
            ));
            
        } catch (Exception e) {
            log.error("Error getting qualified listening history for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get qualified listening history: " + e.getMessage()));
        }
    }
} 