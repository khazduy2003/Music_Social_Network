package com.musicsocial.service.impl;

import com.musicsocial.domain.User;
import com.musicsocial.domain.UserPreference;
import com.musicsocial.domain.ListeningHistory;
import com.musicsocial.dto.preference.UserPreferenceDTO;
import com.musicsocial.exception.ResourceNotFoundException;
import com.musicsocial.mapper.UserPreferenceMapper;
import com.musicsocial.repository.UserPreferenceRepository;
import com.musicsocial.repository.UserRepository;
import com.musicsocial.repository.ListeningHistoryRepository;
import com.musicsocial.service.UserPreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserPreferenceServiceImpl implements UserPreferenceService {

    private final UserRepository userRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final UserPreferenceMapper userPreferenceMapper;
    private final ListeningHistoryRepository listeningHistoryRepository;
    
    private static final int MIN_LISTENING_DURATION = 30; // seconds

    @Override
    @Transactional(readOnly = true)
    public UserPreferenceDTO getUserPreferences(Long userId) {
        UserPreference preferences = userPreferenceRepository.findByUserIdWithUser(userId)
                .orElseGet(() -> {
                    // Tạo empty preferences nếu chưa có thay vì throw exception
                    log.info("No existing preferences found for user {}, creating empty preferences", userId);
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                    UserPreference newPreferences = new UserPreference();
                    newPreferences.setUser(user);
                    newPreferences.setPreferredArtists(new HashSet<>());
                    newPreferences.setPreferredGenres(new HashSet<>());
                    return newPreferences;
                });
        return userPreferenceMapper.toDTO(preferences);
    }

    @Override
    public UserPreferenceDTO updateUserPreferences(Long userId, Set<String> preferredGenres, Set<String> preferredArtists) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        UserPreference preferences = userPreferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserPreference newPreferences = new UserPreference();
                    newPreferences.setUser(user);
                    return newPreferences;
                });

        preferences.setPreferredGenres(preferredGenres);
        preferences.setPreferredArtists(preferredArtists);

        return userPreferenceMapper.toDTO(userPreferenceRepository.save(preferences));
    }

    @Override
    public void addPreferredGenre(Long userId, String genre) {
        UserPreference preferences = userPreferenceRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User preferences not found for user: " + userId));
        preferences.getPreferredGenres().add(genre);
        userPreferenceRepository.save(preferences);
    }

    @Override
    public void removePreferredGenre(Long userId, String genre) {
        UserPreference preferences = userPreferenceRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User preferences not found for user: " + userId));
        preferences.getPreferredGenres().remove(genre);
        userPreferenceRepository.save(preferences);
    }

    @Override
    public void addPreferredArtist(Long userId, String artist) {
        UserPreference preferences = userPreferenceRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User preferences not found for user: " + userId));
        preferences.getPreferredArtists().add(artist);
        userPreferenceRepository.save(preferences);
    }

    @Override
    public void removePreferredArtist(Long userId, String artist) {
        UserPreference preferences = userPreferenceRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User preferences not found for user: " + userId));
        preferences.getPreferredArtists().remove(artist);
        userPreferenceRepository.save(preferences);
    }

    @Override
    public UserPreferenceDTO updatePreferencesFromListeningHistory(Long userId) {
        log.info("Updating user preferences from listening history for user: {}", userId);
        
        try {
            // 1. Kiểm tra xem user có listening history >30s không
            List<ListeningHistory> qualifiedHistory = listeningHistoryRepository
                    .findByUserIdAndDurationGreaterThanOrderByCreatedAtDesc(userId, MIN_LISTENING_DURATION);
            
            if (qualifiedHistory.isEmpty()) {
                log.info("No qualified listening history found for user: {}", userId);
                // Tạo empty preferences nếu chưa có
                return getOrCreateEmptyPreferences(userId);
            }
            
            // 2. Lấy artists từ qualified listening history
            Set<String> listenedArtists = qualifiedHistory.stream()
                    .map(lh -> lh.getTrack().getArtist())
                    .filter(Objects::nonNull)
                    .filter(artist -> !artist.trim().isEmpty())
                    .collect(Collectors.toSet());
            
            // 3. Lấy genres từ qualified listening history + fallback mapping
            Set<String> listenedGenres = new HashSet<>();
            
            // First try to get genres from tracks
            Set<String> trackGenres = qualifiedHistory.stream()
                    .map(lh -> lh.getTrack().getGenre())
                    .filter(Objects::nonNull)
                    .filter(genre -> !genre.trim().isEmpty())
                    .collect(Collectors.toSet());
            
            listenedGenres.addAll(trackGenres);
            
            // Fallback: Map artists to likely genres
            Map<String, String> artistToGenreMapping = getArtistToGenreMapping();
            for (String artist : listenedArtists) {
                String mappedGenre = artistToGenreMapping.get(artist.toLowerCase());
                if (mappedGenre != null) {
                    listenedGenres.add(mappedGenre);
                }
            }
            
            log.info("Found {} artists and {} genres (including mapped) from listening history for user: {}", 
                    listenedArtists.size(), listenedGenres.size(), userId);
            log.info("Listened artists: {}", listenedArtists);
            log.info("Listened genres: {}", listenedGenres);
            
            // 4. Cập nhật hoặc tạo mới user preferences
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
            
            UserPreference preferences = userPreferenceRepository.findByUserId(userId)
                    .orElseGet(() -> {
                        UserPreference newPreferences = new UserPreference();
                        newPreferences.setUser(user);
                        return newPreferences;
                    });
            
            // 5. Merge với existing preferences (không override hoàn toàn)
            Set<String> updatedArtists = new HashSet<>(preferences.getPreferredArtists());
            updatedArtists.addAll(listenedArtists);
            
            Set<String> updatedGenres = new HashSet<>(preferences.getPreferredGenres());
            updatedGenres.addAll(listenedGenres);
            
            preferences.setPreferredArtists(updatedArtists);
            preferences.setPreferredGenres(updatedGenres);
            
            UserPreference savedPreferences = userPreferenceRepository.save(preferences);
            
            log.info("Successfully updated preferences for user: {} - {} artists, {} genres", 
                    userId, updatedArtists.size(), updatedGenres.size());
            
            return userPreferenceMapper.toDTO(savedPreferences);
            
        } catch (Exception e) {
            log.error("Error updating preferences from listening history for user: {}", userId, e);
            throw new RuntimeException("Failed to update preferences from listening history", e);
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean hasValidListeningHistory(Long userId) {
        try {
            List<ListeningHistory> qualifiedHistory = listeningHistoryRepository
                    .findByUserIdAndDurationGreaterThanOrderByCreatedAtDesc(userId, MIN_LISTENING_DURATION);
            
            boolean hasValidHistory = !qualifiedHistory.isEmpty();
            log.info("User {} has valid listening history: {}", userId, hasValidHistory);
            
            return hasValidHistory;
        } catch (Exception e) {
            log.error("Error checking listening history for user: {}", userId, e);
            return false;
        }
    }
    
    private UserPreferenceDTO getOrCreateEmptyPreferences(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        UserPreference preferences = userPreferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserPreference newPreferences = new UserPreference();
                    newPreferences.setUser(user);
                    newPreferences.setPreferredArtists(new HashSet<>());
                    newPreferences.setPreferredGenres(new HashSet<>());
                    return userPreferenceRepository.save(newPreferences);
                });
        
        return userPreferenceMapper.toDTO(preferences);
    }

    private Map<String, String> getArtistToGenreMapping() {
        Map<String, String> mapping = new HashMap<>();
        
        // Map known artists to genres based on their typical style
        mapping.put("jahzzar", "electronic");
        mapping.put("pkrz", "electronic");
        mapping.put("stefan kartenberg", "jazz");
        mapping.put("snakesart", "ambient");
        mapping.put("wally", "pop");
        mapping.put("bralitz", "electronic");
        mapping.put("skala", "ambient");
        mapping.put("braincontrol", "rock");
        
        return mapping;
    }
} 