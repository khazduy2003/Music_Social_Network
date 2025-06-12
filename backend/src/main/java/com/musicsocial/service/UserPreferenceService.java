package com.musicsocial.service;

import com.musicsocial.dto.preference.UserPreferenceDTO;
import java.util.Set;

public interface UserPreferenceService {
    UserPreferenceDTO getUserPreferences(Long userId);
    UserPreferenceDTO updateUserPreferences(Long userId, Set<String> preferredGenres, Set<String> preferredArtists);
    void addPreferredGenre(Long userId, String genre);
    void removePreferredGenre(Long userId, String genre);
    void addPreferredArtist(Long userId, String artist);
    void removePreferredArtist(Long userId, String artist);
    
    /**
     * Update user preferences based on listening history (duration > 30s)
     * This method analyzes user's listening history and automatically updates their preferences
     */
    UserPreferenceDTO updatePreferencesFromListeningHistory(Long userId);
    
    /**
     * Check if user has sufficient listening history for recommendations
     */
    boolean hasValidListeningHistory(Long userId);
} 