package com.musicsocial.service;

import com.musicsocial.dto.track.TrackDTO;
import com.musicsocial.dto.track.TrackCreateDTO;
import com.musicsocial.dto.track.TrackUpdateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface TrackService {
    TrackDTO createTrack(TrackCreateDTO trackCreateDTO);
    TrackDTO uploadTrack(String title, String artist, String album, String genre, String description, 
                        MultipartFile audioFile, MultipartFile coverImage, Long userId);
    TrackDTO getTrackById(Long id);
    TrackDTO getTrackById(Long id, Long userId);
    Page<TrackDTO> getAllTracks(Pageable pageable);
    Page<TrackDTO> getAllTracks(Pageable pageable, Long userId);
    Page<TrackDTO> getTracksByUser(String username, Pageable pageable);
    Page<TrackDTO> getTracksByUser(String username, Pageable pageable, Long userId);
    TrackDTO updateTrack(Long id, TrackUpdateDTO trackUpdateDTO);
    TrackDTO updateTrack(Long id, TrackUpdateDTO trackUpdateDTO, Long userId);
    void deleteTrack(Long id);
    void likeTrack(Long userId, Long trackId);
    void unlikeTrack(Long userId, Long trackId);
    void rateTrack(Long userId, Long trackId, Double rating);
    void incrementPlayCount(Long trackId);
    Page<TrackDTO> searchTracks(String query, Pageable pageable);
    Page<TrackDTO> searchTracks(String query, Pageable pageable, Long userId);
    Page<TrackDTO> getTracksByGenre(String genre, Pageable pageable);
    Page<TrackDTO> getTracksByGenre(String genre, Pageable pageable, Long userId);
    Page<TrackDTO> getMostPlayedTracks(Long userId, Pageable pageable);
    Page<TrackDTO> getTopRatedTracks(Long userId, Pageable pageable);
    List<TrackDTO> getLikedTracks(Long userId);
    Page<TrackDTO> getTracksLikedByFollowing(Long userId, Pageable pageable);
    List<TrackDTO> getAllTracksForDiscover(Long userId);
} 