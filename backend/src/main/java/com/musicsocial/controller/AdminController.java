package com.musicsocial.controller;

import com.musicsocial.domain.Track;
import com.musicsocial.repository.TrackRepository;
import com.musicsocial.service.JamendoService;
import com.musicsocial.service.UserPreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final JamendoService jamendoService;
    private final TrackRepository trackRepository;
    private final UserPreferenceService userPreferenceService;

    @PostMapping("/update-genres")
    public ResponseEntity<?> updateTrackGenres() {
        log.info("Starting manual genre update for tracks using artist-genre mapping...");
        
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
    public ResponseEntity<String> updateUserPreferences(@RequestParam Long userId) {
        userPreferenceService.updatePreferencesFromListeningHistory(userId);
        return ResponseEntity.ok("User preferences updated successfully");
    }
} 