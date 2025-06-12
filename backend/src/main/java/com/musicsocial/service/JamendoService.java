package com.musicsocial.service;

import com.musicsocial.dto.track.TrackDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface JamendoService {
    Page<TrackDTO> searchTracks(String query, Pageable pageable);
    Page<TrackDTO> getTracksByGenre(String genre, Pageable pageable);
    Page<TrackDTO> getPopularTracks(Pageable pageable);
    TrackDTO getTrackById(String jamendoId);
} 