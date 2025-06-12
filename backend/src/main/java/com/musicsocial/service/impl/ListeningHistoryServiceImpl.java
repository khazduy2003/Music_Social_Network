package com.musicsocial.service.impl;

import com.musicsocial.domain.ListeningHistory;
import com.musicsocial.domain.Track;
import com.musicsocial.domain.User;
import com.musicsocial.dto.history.ListeningHistoryDTO;
import com.musicsocial.exception.ResourceNotFoundException;
import com.musicsocial.mapper.ListeningHistoryMapper;
import com.musicsocial.repository.ListeningHistoryRepository;
import com.musicsocial.repository.TrackRepository;
import com.musicsocial.repository.UserRepository;
import com.musicsocial.service.ListeningHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ListeningHistoryServiceImpl implements ListeningHistoryService {

    private final ListeningHistoryRepository listeningHistoryRepository;
    private final UserRepository userRepository;
    private final TrackRepository trackRepository;
    private final ListeningHistoryMapper listeningHistoryMapper;

    @Override
    @Transactional
    public ListeningHistoryDTO addToHistory(Long userId, Long trackId, Integer duration) {
        try {
            log.info("Adding to history - Finding user: {}", userId);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        log.error("User not found with id: {}", userId);
                        return new ResourceNotFoundException("User not found with id: " + userId);
                    });
            log.info("User found: {}", user.getUsername());

            log.info("Adding to history - Finding track: {}", trackId);
            Track track = trackRepository.findById(trackId)
                    .orElseThrow(() -> {
                        log.error("Track not found with id: {}", trackId);
                        return new ResourceNotFoundException("Track not found with id: " + trackId);
                    });
            log.info("Track found: {}", track.getTitle());

            if (duration == null || duration <= 0) {
                log.error("Invalid duration: {}", duration);
                throw new IllegalArgumentException("Duration must be greater than 0");
            }

            // Minimum duration check - 30 seconds or 25% of track length, whichever is less
            int minimumRequiredDuration = Math.min(30, (track.getDuration() != null ? track.getDuration() / 4 : 30));
            
            if (duration < minimumRequiredDuration) {
                log.info("Play duration {} is less than minimum required duration {} for track: {}", 
                        duration, minimumRequiredDuration, track.getTitle());
                // Still record in history but mark as incomplete listen
                ListeningHistory history = new ListeningHistory();
                history.setUser(user);
                history.setTrack(track);
                history.setDuration(duration);
                history.setCountAsPlay(false); // Mark as not counting toward play count
                
                ListeningHistory savedHistory = listeningHistoryRepository.save(history);
                return listeningHistoryMapper.toDTO(savedHistory);
            }

            ListeningHistory history = new ListeningHistory();
            history.setUser(user);
            history.setTrack(track);
            history.setDuration(duration);
            history.setCountAsPlay(true); // This counts as a valid play

            log.info("Saving listening history for user: {} and track: {} with duration: {}", 
                    user.getUsername(), track.getTitle(), duration);
            ListeningHistory savedHistory = listeningHistoryRepository.save(history);
            log.info("Listening history saved with id: {}", savedHistory.getId());

            ListeningHistoryDTO dto = listeningHistoryMapper.toDTO(savedHistory);
            log.info("Successfully converted to DTO with id: {}", dto.getId());
            return dto;
        } catch (ResourceNotFoundException e) {
            log.error("Resource not found: {}", e.getMessage());
            throw e;
        } catch (IllegalArgumentException e) {
            log.error("Invalid argument: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error adding to history: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to add to history: " + e.getMessage(), e);
        }
    }

    @Override
    public Page<ListeningHistoryDTO> getUserHistory(Long userId, Pageable pageable) {
        try {
            log.info("Getting history for user: {}", userId);
            Page<ListeningHistoryDTO> history = listeningHistoryRepository.findByUserId(userId, pageable)
                    .map(listeningHistoryMapper::toDTO);
            log.info("Found {} history entries for user {}", history.getTotalElements(), userId);
            return history;
        } catch (Exception e) {
            log.error("Error getting user history: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public List<Object[]> getMostListenedTracks(Long userId, Pageable pageable) {
        try {
            log.info("Getting most listened tracks for user: {}", userId);
            List<Object[]> tracks = listeningHistoryRepository.findMostListenedTracks(userId, pageable);
            log.info("Found {} most listened tracks for user {}", tracks.size(), userId);
            return tracks;
        } catch (Exception e) {
            log.error("Error getting most listened tracks: {}", e.getMessage(), e);
            throw e;
        }
    }

    @Override
    public Page<Object[]> getRecentTracks(Long userId, Pageable pageable) {
        try {
            log.info("Getting recent tracks for user: {}", userId);
            Page<Object[]> tracks = listeningHistoryRepository.findRecentTracks(userId, pageable);
            log.info("Found {} recent tracks for user {}", tracks.getTotalElements(), userId);
            return tracks;
        } catch (Exception e) {
            log.error("Error getting recent tracks: {}", e.getMessage(), e);
            throw e;
        }
    }
} 