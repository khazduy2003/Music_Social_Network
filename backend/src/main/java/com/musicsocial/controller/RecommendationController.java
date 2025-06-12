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

    @GetMapping("/debug/{userId}")
    @Operation(summary = "Debug recommendation system", 
               description = "Debug endpoint to check system status")
    public ResponseEntity<?> debugRecommendations(@PathVariable Long userId) {
        log.info("Debug recommendations for user: {}", userId);
        
        try {
            Map<String, Object> debugInfo = new HashMap<>();
            
            // Check if user exists
            debugInfo.put("userId", userId);
            debugInfo.put("timestamp", new Date());
            
            // Simple test
            debugInfo.put("status", "API is working");
            
            return ResponseEntity.ok(debugInfo);
            
        } catch (Exception e) {
            log.error("Error in debug endpoint for user: {}", userId, e);
            return ResponseEntity.internalServerError().body("Debug error: " + e.getMessage());
        }
    }
} 