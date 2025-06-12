package com.musicsocial.controller;

import com.musicsocial.dto.track.TrackDTO;
import com.musicsocial.dto.playlist.PlaylistDTO;
import com.musicsocial.dto.user.UserDTO;
import com.musicsocial.service.TrackService;
import com.musicsocial.service.PlaylistService;
import com.musicsocial.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class SearchController {
    private final TrackService trackService;
    private final PlaylistService playlistService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String q,
            Pageable pageable) {
        Map<String, Object> results = new HashMap<>();
        
        Page<TrackDTO> tracks = trackService.searchTracks(q, pageable);
        Page<PlaylistDTO> playlists = playlistService.searchPlaylists(q, pageable);
        Page<UserDTO> users = userService.searchUsers(q, pageable);

        results.put("tracks", tracks.getContent());
        results.put("playlists", playlists.getContent());
        results.put("users", users.getContent());

        return ResponseEntity.ok(results);
    }

    @GetMapping("/tracks")
    public ResponseEntity<Page<TrackDTO>> searchTracks(
            @RequestParam String q,
            Pageable pageable) {
        return ResponseEntity.ok(trackService.searchTracks(q, pageable));
    }

    @GetMapping("/playlists")
    public ResponseEntity<Page<PlaylistDTO>> searchPlaylists(
            @RequestParam String q,
            Pageable pageable) {
        return ResponseEntity.ok(playlistService.searchPlaylists(q, pageable));
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserDTO>> searchUsers(
            @RequestParam String q,
            Pageable pageable) {
        return ResponseEntity.ok(userService.searchUsers(q, pageable));
    }
} 