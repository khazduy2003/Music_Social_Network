package com.musicsocial.controller;

import com.musicsocial.dto.track.TrackDTO;
import com.musicsocial.service.RecommendationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Tag(name = "Recommendations", description = "Music recommendation API")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get personalized recommendations for user", 
               description = "Get track recommendations based on user's listening history (same artists and genres)")
    public ResponseEntity<Page<TrackDTO>> getRecommendationsForUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        log.info("Getting recommendations for user: {}, page: {}, size: {}", userId, page, size);
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<TrackDTO> recommendations = recommendationService.getRecommendationsForUser(userId, pageable);
            
            log.info("Found {} recommendations for user: {}", recommendations.getTotalElements(), userId);
            return ResponseEntity.ok(recommendations);
            
        } catch (Exception e) {
            log.error("Error getting recommendations for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/user/{userId}/by-artist")
    @Operation(summary = "Get artist-based recommendations", 
               description = "Get track recommendations from same artists user has listened to")
    public ResponseEntity<List<TrackDTO>> getRecommendationsByArtist(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Getting artist-based recommendations for user: {}, limit: {}", userId, limit);
        
        try {
            List<TrackDTO> recommendations = recommendationService.getRecommendationsByArtist(userId, limit);
            
            log.info("Found {} artist-based recommendations for user: {}", recommendations.size(), userId);
            return ResponseEntity.ok(recommendations);
            
        } catch (Exception e) {
            log.error("Error getting artist-based recommendations for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/user/{userId}/by-genre")
    @Operation(summary = "Get genre-based recommendations", 
               description = "Get track recommendations from same genres user has listened to")
    public ResponseEntity<List<TrackDTO>> getRecommendationsByGenre(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Getting genre-based recommendations for user: {}, limit: {}", userId, limit);
        
        try {
            List<TrackDTO> recommendations = recommendationService.getRecommendationsByGenre(userId, limit);
            
            log.info("Found {} genre-based recommendations for user: {}", recommendations.size(), userId);
            return ResponseEntity.ok(recommendations);
            
        } catch (Exception e) {
            log.error("Error getting genre-based recommendations for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /*
    @GetMapping("/debug/{userId}")
    @Operation(summary = "Debug recommendation system", 
               description = "Debug endpoint to check database content and matching logic")
    public ResponseEntity<?> debugRecommendations(@PathVariable Long userId) {
        log.info("Debug recommendations for user: {}", userId);
        
        try {
            Map<String, Object> debugInfo = new HashMap<>();
            
            // 1. Get user preferences with eager fetching
            var userPreferenceOpt = userPreferenceRepository.findByUserIdWithCollections(userId);
            if (userPreferenceOpt.isPresent()) {
                var prefs = userPreferenceOpt.get();
                debugInfo.put("preferredArtists", prefs.getPreferredArtists());
                debugInfo.put("preferredGenres", prefs.getPreferredGenres());
                
                // 2. For each preferred artist, check what tracks exist
                Map<String, List<String>> artistTracks = new HashMap<>();
                for (String artist : prefs.getPreferredArtists()) {
                    List<String> tracks = trackRepository.findByArtistIgnoreCase(artist)
                            .stream()
                            .map(track -> track.getId() + ": " + track.getTitle())
                            .collect(Collectors.toList());
                    artistTracks.put(artist, tracks);
                }
                debugInfo.put("artistTracks", artistTracks);
                
                // 3. Check what tracks user has listened to
                Set<Long> listenedIds = listeningHistoryRepository.findDistinctTrackIdsByUserId(userId);
                debugInfo.put("listenedTrackIds", listenedIds);
                debugInfo.put("listenedTrackCount", listenedIds.size());
                
                // 4. Get sample of all tracks in database to verify artist names
                List<String> allTracks = trackRepository.findAll().stream()
                        .limit(20)
                        .map(track -> track.getId() + ": '" + track.getArtist() + "' - " + track.getTitle())
                        .collect(Collectors.toList());
                debugInfo.put("sampleTracks", allTracks);
                
                // 5. Count total tracks per artist in database
                Map<String, Long> artistTrackCounts = new HashMap<>();
                for (String artist : prefs.getPreferredArtists()) {
                    long count = trackRepository.findByArtistIgnoreCase(artist).size();
                    artistTrackCounts.put(artist, count);
                }
                debugInfo.put("artistTrackCounts", artistTrackCounts);
                
            } else {
                debugInfo.put("error", "No user preferences found for user: " + userId);
            }
            
            return ResponseEntity.ok(debugInfo);
            
        } catch (Exception e) {
            log.error("Error debugging recommendations for user: {}", userId, e);
            return ResponseEntity.internalServerError().body("Debug error: " + e.getMessage());
        }
    }
    */
} 