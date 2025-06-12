package com.musicsocial.service.impl;

import com.musicsocial.domain.Playlist;
import com.musicsocial.domain.Track;
import com.musicsocial.domain.User;
import com.musicsocial.dto.playlist.PlaylistDTO;
import com.musicsocial.dto.playlist.PlaylistCreateDTO;
import com.musicsocial.dto.playlist.PlaylistUpdateDTO;
import com.musicsocial.exception.ResourceNotFoundException;
import com.musicsocial.mapper.PlaylistMapper;
import com.musicsocial.repository.PlaylistRepository;
import com.musicsocial.repository.TrackRepository;
import com.musicsocial.repository.UserRepository;
import com.musicsocial.service.PlaylistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PlaylistServiceImpl implements PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final UserRepository userRepository;
    private final TrackRepository trackRepository;
    private final PlaylistMapper playlistMapper;

    @Override
    public PlaylistDTO createPlaylist(PlaylistCreateDTO playlistCreateDTO) {
        User user = userRepository.findById(playlistCreateDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + playlistCreateDTO.getUserId()));

        Playlist playlist = playlistMapper.toEntity(playlistCreateDTO);
        playlist.setUser(user);
        return playlistMapper.toDTO(playlistRepository.save(playlist));
    }

    @Override
    @Transactional(readOnly = true)
    public PlaylistDTO getPlaylistById(Long id) {
        return playlistMapper.toDTO(playlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found with id: " + id)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PlaylistDTO> getAllPlaylists(Pageable pageable) {
        return playlistRepository.findAll(pageable).map(playlistMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PlaylistDTO> getPlaylistsByUser(String username, Pageable pageable) {
        return playlistRepository.findByUserUsername(username, pageable).map(playlistMapper::toDTO);
    }

    @Override
    public PlaylistDTO updatePlaylist(Long id, PlaylistUpdateDTO playlistUpdateDTO) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found with id: " + id));
        
        playlistMapper.updateEntityFromDTO(playlistUpdateDTO, playlist);
        return playlistMapper.toDTO(playlistRepository.save(playlist));
    }

    @Override
    public void deletePlaylist(Long id) {
        if (!playlistRepository.existsById(id)) {
            throw new ResourceNotFoundException("Playlist not found with id: " + id);
        }
        playlistRepository.deleteById(id);
    }

    @Override
    public void addTrackToPlaylist(Long playlistId, Long trackId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found with id: " + playlistId));
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found with id: " + trackId));

        playlist.getTracks().add(track);
        playlistRepository.save(playlist);
    }

    @Override
    public void removeTrackFromPlaylist(Long playlistId, Long trackId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found with id: " + playlistId));
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found with id: " + trackId));

        playlist.getTracks().remove(track);
        playlistRepository.save(playlist);
    }

    @Override
    public void likePlaylist(Long userId, Long playlistId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found with id: " + playlistId));

        user.getLikedPlaylists().add(playlist);
        userRepository.save(user);
    }

    @Override
    public void unlikePlaylist(Long userId, Long playlistId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found with id: " + playlistId));

        user.getLikedPlaylists().remove(playlist);
        userRepository.save(user);
    }

    @Override
    public void incrementPlayCount(Long playlistId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Playlist not found with id: " + playlistId));
        
        Integer currentPlayCount = playlist.getPlayCount();
        if (currentPlayCount == null) {
            currentPlayCount = 0;
        }
        playlist.setPlayCount(currentPlayCount + 1);
        playlistRepository.save(playlist);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PlaylistDTO> searchPlaylists(String query, Pageable pageable) {
        return playlistRepository.searchPublicPlaylists(query, pageable).map(playlistMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PlaylistDTO> getMostPlayedPlaylists(Pageable pageable) {
        return playlistRepository.findMostPlayed(pageable).map(playlistMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PlaylistDTO> getPublicPlaylists(Pageable pageable) {
        return playlistRepository.findByIsPublicTrue(pageable).map(playlistMapper::toDTO);
    }
} 