package com.musicsocial.service.impl;

import com.musicsocial.dto.track.TrackDTO;
import com.musicsocial.mapper.TrackMapper;
import com.musicsocial.repository.ListeningHistoryRepository;
import com.musicsocial.repository.TrackRepository;
import com.musicsocial.repository.UserPreferenceRepository;
import com.musicsocial.service.RecommendationService;
import com.musicsocial.service.UserPreferenceService;
import com.musicsocial.domain.Track;
import com.musicsocial.domain.UserPreference;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private final ListeningHistoryRepository listeningHistoryRepository;
    private final TrackRepository trackRepository;
    private final TrackMapper trackMapper;
    private final UserPreferenceRepository userPreferenceRepository;
    private final UserPreferenceService userPreferenceService;
    
    private static final int MIN_LISTENING_DURATION = 30; // seconds

    @Override
    @Transactional(readOnly = true)
    public Page<TrackDTO> getRecommendationsForUser(Long userId, Pageable pageable) {
        log.info("Getting recommendations for user: {}", userId);
        
        try {
            // Simple fallback first to ensure we always return something
            return getFallbackRecommendations(userId, pageable);
            
            // Comment out the complex logic temporarily
            /*
            // 1. Cập nhật user preferences từ listening history trước
            try {
                if (userPreferenceService.hasValidListeningHistory(userId)) {
                    log.info("Updating preferences from listening history for user: {}", userId);
                    userPreferenceService.updatePreferencesFromListeningHistory(userId);
                }
            } catch (Exception e) {
                log.warn("Failed to update preferences from listening history for user: {}", userId, e);
            }
            
            // 2. Lấy recommendations dựa trên stored preferences
            List<TrackDTO> artistRecommendations = getRecommendationsByArtist(userId, 10);
            List<TrackDTO> genreRecommendations = getRecommendationsByGenre(userId, 10);
            
            log.info("Artist recommendations: {}, Genre recommendations: {}", 
                    artistRecommendations.size(), genreRecommendations.size());
            
            // 3. Combine và deduplicate recommendations
            Set<TrackDTO> combinedRecommendations = new LinkedHashSet<>();
            combinedRecommendations.addAll(artistRecommendations);
            combinedRecommendations.addAll(genreRecommendations);
            
            // 4. Nếu không có recommendations, return fallback tracks
            if (combinedRecommendations.isEmpty()) {
                log.info("No recommendations found, returning fallback tracks for user: {}", userId);
                return getFallbackRecommendations(userId, pageable);
            }
            
            // 5. Convert to list và apply pagination
            List<TrackDTO> recommendations = new ArrayList<>(combinedRecommendations);
            
            // Shuffle for variety
            Collections.shuffle(recommendations);
            
            // Apply pagination
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), recommendations.size());
            
            if (start >= recommendations.size()) {
                return new PageImpl<>(Collections.emptyList(), pageable, recommendations.size());
            }
            
            List<TrackDTO> paginatedResults = recommendations.subList(start, end);
            
            log.info("Returning {} recommendations for user: {}", paginatedResults.size(), userId);
            return new PageImpl<>(paginatedResults, pageable, recommendations.size());
            */
            
        } catch (Exception e) {
            log.error("Error getting recommendations for user: {}", userId, e);
            // Simple fallback to avoid further errors
            try {
                return getFallbackRecommendations(userId, pageable);
            } catch (Exception fallbackError) {
                log.error("Error in fallback recommendations for user: {}", userId, fallbackError);
                // Return empty page as last resort
                return new PageImpl<>(Collections.emptyList(), pageable, 0);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrackDTO> getRecommendationsByArtist(Long userId, int limit) {
        log.info("Getting artist-based recommendations for user: {} with limit: {}", userId, limit);
        
        try {
            // 1. Lấy preferred artists từ UserPreference table
            Optional<UserPreference> userPreferenceOpt = userPreferenceRepository.findByUserId(userId);
            
            if (userPreferenceOpt.isEmpty() || userPreferenceOpt.get().getPreferredArtists().isEmpty()) {
                log.info("No preferred artists found for user: {}", userId);
                return Collections.emptyList();
            }
            
            Set<String> preferredArtists = userPreferenceOpt.get().getPreferredArtists();
            log.info("Found {} preferred artists for user: {}: {}", preferredArtists.size(), userId, preferredArtists);
            
            // 2. Lấy tracks đã nghe để exclude
            Set<Long> listenedTrackIds = listeningHistoryRepository
                    .findDistinctTrackIdsByUserId(userId);
            log.info("User {} has listened to {} tracks: {}", userId, listenedTrackIds.size(), listenedTrackIds);
            
            // 3. Tìm tracks từ preferred artists (exclude already listened)
            List<TrackDTO> recommendations = new ArrayList<>();
            
            for (String artist : preferredArtists) {
                log.info("Searching tracks for artist: '{}'", artist);
                
                // Debug: First get all tracks for this artist
                List<TrackDTO> allArtistTracks = trackRepository
                        .findByArtistIgnoreCase(artist)
                        .stream()
                        .map(track -> trackMapper.toDTO(track, userId))
                        .collect(Collectors.toList());
                log.info("Found {} total tracks for artist '{}': {}", 
                    allArtistTracks.size(), artist, 
                    allArtistTracks.stream().map(t -> t.getTitle()).collect(Collectors.toList()));
                
                // Try to get unlistened tracks first
                List<TrackDTO> artistTracks = trackRepository
                        .findByArtistIgnoreCaseAndIdNotIn(artist, listenedTrackIds.isEmpty() ? Set.of(0L) : listenedTrackIds)
                        .stream()
                        .map(track -> trackMapper.toDTO(track, userId))
                        .limit(Math.max(1, limit / preferredArtists.size())) // Ensure at least 1 per artist
                        .collect(Collectors.toList());
                
                // If no unlistened tracks found, include listened tracks to ensure we have recommendations
                if (artistTracks.isEmpty() && !allArtistTracks.isEmpty()) {
                    log.info("No unlistened tracks found for artist '{}', including listened tracks", artist);
                    artistTracks = allArtistTracks.stream()
                            .limit(Math.max(1, limit / preferredArtists.size()))
                            .collect(Collectors.toList());
                }
                
                log.info("Found {} final tracks for artist '{}': {}", 
                    artistTracks.size(), artist,
                    artistTracks.stream().map(t -> t.getTitle()).collect(Collectors.toList()));
                
                recommendations.addAll(artistTracks);
            }
            
            // 4. Shuffle and limit
            Collections.shuffle(recommendations);
            List<TrackDTO> result = recommendations.stream()
                    .limit(limit)
                    .collect(Collectors.toList());
            
            log.info("Returning {} artist-based recommendations for user: {}: {}", 
                result.size(), userId,
                result.stream().map(t -> t.getArtist() + " - " + t.getTitle()).collect(Collectors.toList()));
            return result;
            
        } catch (Exception e) {
            log.error("Error getting artist-based recommendations for user: {}", userId, e);
            return Collections.emptyList();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrackDTO> getRecommendationsByGenre(Long userId, int limit) {
        log.info("Getting genre-based recommendations for user: {} with limit: {}", userId, limit);
        
        try {
            // 1. Lấy preferred genres từ UserPreference table
            Optional<UserPreference> userPreferenceOpt = userPreferenceRepository.findByUserId(userId);
            
            if (userPreferenceOpt.isEmpty() || userPreferenceOpt.get().getPreferredGenres().isEmpty()) {
                log.info("No preferred genres found for user: {}", userId);
                return Collections.emptyList();
            }
            
            Set<String> preferredGenres = userPreferenceOpt.get().getPreferredGenres();
            log.info("Found {} preferred genres for user: {}: {}", preferredGenres.size(), userId, preferredGenres);
            
            // 2. Lấy tracks đã nghe để exclude
            Set<Long> listenedTrackIds = listeningHistoryRepository
                    .findDistinctTrackIdsByUserId(userId);
            log.info("User {} has listened to {} tracks for genre filtering: {}", userId, listenedTrackIds.size(), listenedTrackIds);
            
            // 3. Tìm tracks từ preferred genres (exclude already listened)
            List<TrackDTO> recommendations = new ArrayList<>();
            
            for (String genre : preferredGenres) {
                log.info("Searching tracks for genre: '{}'", genre);
                
                // Debug: First get all tracks for this genre
                List<TrackDTO> allGenreTracks = trackRepository
                        .findByGenreIgnoreCase(genre)
                        .stream()
                        .map(track -> trackMapper.toDTO(track, userId))
                        .collect(Collectors.toList());
                log.info("Found {} total tracks for genre '{}': {}", 
                    allGenreTracks.size(), genre, 
                    allGenreTracks.stream().map(t -> t.getTitle()).collect(Collectors.toList()));
                
                List<TrackDTO> genreTracks = trackRepository
                        .findByGenreIgnoreCaseAndIdNotIn(genre, listenedTrackIds.isEmpty() ? Set.of(0L) : listenedTrackIds)
                        .stream()
                        .map(track -> trackMapper.toDTO(track, userId))
                        .limit(Math.max(1, limit / preferredGenres.size())) // Ensure at least 1 per genre
                .collect(Collectors.toList());

                log.info("Found {} unlistened tracks for genre '{}': {}", 
                    genreTracks.size(), genre,
                    genreTracks.stream().map(t -> t.getTitle()).collect(Collectors.toList()));
                
                recommendations.addAll(genreTracks);
            }
            
            // 4. Shuffle and limit
            Collections.shuffle(recommendations);
            List<TrackDTO> result = recommendations.stream()
                    .limit(limit)
                    .collect(Collectors.toList());
            
            log.info("Returning {} genre-based recommendations for user: {}: {}", 
                result.size(), userId,
                result.stream().map(t -> t.getArtist() + " - " + t.getTitle()).collect(Collectors.toList()));
            return result;
            
        } catch (Exception e) {
            log.error("Error getting genre-based recommendations for user: {}", userId, e);
            return Collections.emptyList();
        }
    }
    
    /**
     * Fallback method to get tracks when no recommendations available
     */
    private Page<TrackDTO> getFallbackRecommendations(Long userId, Pageable pageable) {
        try {
            log.info("Getting fallback recommendations for user: {}", userId);
            // Use simple findAll instead of findMostPlayed to avoid potential issues
            Page<Track> tracks = trackRepository.findAll(pageable);
            Page<TrackDTO> fallbackTracks = tracks.map(track -> trackMapper.toDTO(track, userId));
            
            log.info("Returning {} fallback tracks for user: {}", fallbackTracks.getContent().size(), userId);
            return fallbackTracks;
        } catch (Exception e) {
            log.error("Error getting fallback recommendations for user: {}", userId, e);
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }
    }
} 