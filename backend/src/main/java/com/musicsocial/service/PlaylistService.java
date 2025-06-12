package com.musicsocial.service;

import com.musicsocial.dto.playlist.PlaylistDTO;
import com.musicsocial.dto.playlist.PlaylistCreateDTO;
import com.musicsocial.dto.playlist.PlaylistUpdateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PlaylistService {
    PlaylistDTO createPlaylist(PlaylistCreateDTO playlistCreateDTO);
    PlaylistDTO getPlaylistById(Long id);
    Page<PlaylistDTO> getAllPlaylists(Pageable pageable);
    Page<PlaylistDTO> getPlaylistsByUser(String username, Pageable pageable);
    PlaylistDTO updatePlaylist(Long id, PlaylistUpdateDTO playlistUpdateDTO);
    void deletePlaylist(Long id);
    void addTrackToPlaylist(Long playlistId, Long trackId);
    void removeTrackFromPlaylist(Long playlistId, Long trackId);
    void likePlaylist(Long userId, Long playlistId);
    void unlikePlaylist(Long userId, Long playlistId);
    void incrementPlayCount(Long playlistId);
    Page<PlaylistDTO> searchPlaylists(String query, Pageable pageable);
    Page<PlaylistDTO> getMostPlayedPlaylists(Pageable pageable);
    Page<PlaylistDTO> getPublicPlaylists(Pageable pageable);
} 