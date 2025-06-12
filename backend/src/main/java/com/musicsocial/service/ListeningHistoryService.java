package com.musicsocial.service;

import com.musicsocial.dto.history.ListeningHistoryDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ListeningHistoryService {
    ListeningHistoryDTO addToHistory(Long userId, Long trackId, Integer duration);
    Page<ListeningHistoryDTO> getUserHistory(Long userId, Pageable pageable);
    List<Object[]> getMostListenedTracks(Long userId, Pageable pageable);
    Page<Object[]> getRecentTracks(Long userId, Pageable pageable);
} 