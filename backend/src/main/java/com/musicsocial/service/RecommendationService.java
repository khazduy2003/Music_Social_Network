package com.musicsocial.service;

import com.musicsocial.dto.track.TrackDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RecommendationService {
    
    /**
     * Get track recommendations for a user based on their listening history
     * @param userId the user ID
     * @param pageable pagination information
     * @return page of recommended tracks
     */
    Page<TrackDTO> getRecommendationsForUser(Long userId, Pageable pageable);
    
    /**
     * Get track recommendations by artist based on user's listening history
     * @param userId the user ID
     * @param limit maximum number of recommendations
     * @return list of recommended tracks by same artists
     */
    List<TrackDTO> getRecommendationsByArtist(Long userId, int limit);
    
    /**
     * Get track recommendations by genre based on user's listening history
     * @param userId the user ID
     * @param limit maximum number of recommendations
     * @return list of recommended tracks by same genres
     */
    List<TrackDTO> getRecommendationsByGenre(Long userId, int limit);
} 