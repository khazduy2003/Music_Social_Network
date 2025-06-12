package com.musicsocial.controller;

import com.musicsocial.dto.preference.UserPreferenceDTO;
import com.musicsocial.service.UserPreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class UserPreferenceController {

    private final UserPreferenceService userPreferenceService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserPreferenceDTO> getUserPreferences(@PathVariable Long userId) {
        return ResponseEntity.ok(userPreferenceService.getUserPreferences(userId));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserPreferenceDTO> updateUserPreferences(
            @PathVariable Long userId,
            @RequestParam Set<String> preferredGenres,
            @RequestParam Set<String> preferredArtists) {
        return ResponseEntity.ok(userPreferenceService.updateUserPreferences(userId, preferredGenres, preferredArtists));
    }

    @PostMapping("/{userId}/genres/{genre}")
    public ResponseEntity<Void> addPreferredGenre(@PathVariable Long userId, @PathVariable String genre) {
        userPreferenceService.addPreferredGenre(userId, genre);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/genres/{genre}")
    public ResponseEntity<Void> removePreferredGenre(@PathVariable Long userId, @PathVariable String genre) {
        userPreferenceService.removePreferredGenre(userId, genre);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/artists/{artist}")
    public ResponseEntity<Void> addPreferredArtist(@PathVariable Long userId, @PathVariable String artist) {
        userPreferenceService.addPreferredArtist(userId, artist);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}/artists/{artist}")
    public ResponseEntity<Void> removePreferredArtist(@PathVariable Long userId, @PathVariable String artist) {
        userPreferenceService.removePreferredArtist(userId, artist);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/update-from-history")
    public ResponseEntity<UserPreferenceDTO> updatePreferencesFromHistory(@PathVariable Long userId) {
        UserPreferenceDTO updatedPreferences = userPreferenceService.updatePreferencesFromListeningHistory(userId);
        return ResponseEntity.ok(updatedPreferences);
    }

    @GetMapping("/{userId}/has-valid-history")
    public ResponseEntity<Boolean> hasValidListeningHistory(@PathVariable Long userId) {
        boolean hasValidHistory = userPreferenceService.hasValidListeningHistory(userId);
        return ResponseEntity.ok(hasValidHistory);
    }

    @PostMapping("/{userId}/debug-preferences")
    public ResponseEntity<Map<String, Object>> debugUserPreferences(@PathVariable Long userId) {
        try {
            // 1. Check listening history
            boolean hasHistory = userPreferenceService.hasValidListeningHistory(userId);
            
            // 2. Get current preferences (không throw exception)
            UserPreferenceDTO currentPrefs;
            try {
                currentPrefs = userPreferenceService.getUserPreferences(userId);
            } catch (Exception e) {
                currentPrefs = null;
            }
            
            // 3. Update preferences from history
            UserPreferenceDTO updatedPrefs = userPreferenceService.updatePreferencesFromListeningHistory(userId);
            
            Map<String, Object> debugInfo = Map.of(
                "userId", userId,
                "hasValidHistory", hasHistory,
                "currentPreferences", currentPrefs,
                "updatedPreferences", updatedPrefs,
                "timestamp", java.time.LocalDateTime.now()
            );
            
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "error", e.getMessage(),
                "userId", userId
            ));
        }
    }
} 