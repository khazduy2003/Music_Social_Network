package com.musicsocial.service.impl;

import com.musicsocial.dto.track.TrackDTO;
import com.musicsocial.service.JamendoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Slf4j
@Service
@RequiredArgsConstructor
public class JamendoServiceImpl implements JamendoService {

    private final RestTemplate restTemplate;

    @Value("${jamendo.api.url}")
    private String jamendoApiUrl;

    @Value("${jamendo.client.id}")
    private String clientId;

    @Override
    public Page<TrackDTO> searchTracks(String query, Pageable pageable) {
        String url = UriComponentsBuilder.fromHttpUrl(jamendoApiUrl + "/tracks/")
                .queryParam("client_id", clientId)
                .queryParam("format", "json")
                .queryParam("limit", pageable.getPageSize())
                .queryParam("offset", pageable.getPageNumber() * pageable.getPageSize())
                .queryParam("search", query)
                .build()
                .toUriString();

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) {
                return new PageImpl<>(new ArrayList<>(), pageable, 0);
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            if (results == null) {
                return new PageImpl<>(new ArrayList<>(), pageable, 0);
            }

            List<TrackDTO> tracks = results.stream()
                    .map(this::mapToTrackDTO)
                    .toList();

            Integer total = (Integer) response.get("total");
            return new PageImpl<>(tracks, pageable, total != null ? total : 0);
        } catch (Exception e) {
            log.error("Error fetching tracks from Jamendo: ", e);
            return new PageImpl<>(new ArrayList<>(), pageable, 0);
        }
    }

    @Override
    public Page<TrackDTO> getTracksByGenre(String genre, Pageable pageable) {
        String url = UriComponentsBuilder.fromHttpUrl(jamendoApiUrl + "/tracks/")
                .queryParam("client_id", clientId)
                .queryParam("format", "json")
                .queryParam("limit", pageable.getPageSize())
                .queryParam("offset", pageable.getPageNumber() * pageable.getPageSize())
                .queryParam("tags", genre)
                .build()
                .toUriString();

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) {
                return new PageImpl<>(new ArrayList<>(), pageable, 0);
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            if (results == null) {
                return new PageImpl<>(new ArrayList<>(), pageable, 0);
            }

            List<TrackDTO> tracks = results.stream()
                    .map(this::mapToTrackDTO)
                    .toList();

            Integer total = (Integer) response.get("total");
            return new PageImpl<>(tracks, pageable, total != null ? total : 0);
        } catch (Exception e) {
            log.error("Error fetching tracks from Jamendo: ", e);
            return new PageImpl<>(new ArrayList<>(), pageable, 0);
        }
    }

    @Override
    public Page<TrackDTO> getPopularTracks(Pageable pageable) {
        String url = UriComponentsBuilder.fromHttpUrl(jamendoApiUrl + "/tracks/popular/")
                .queryParam("client_id", clientId)
                .queryParam("format", "json")
                .queryParam("limit", pageable.getPageSize())
                .queryParam("offset", pageable.getPageNumber() * pageable.getPageSize())
                .build()
                .toUriString();

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) {
                return new PageImpl<>(new ArrayList<>(), pageable, 0);
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            if (results == null) {
                return new PageImpl<>(new ArrayList<>(), pageable, 0);
            }

            List<TrackDTO> tracks = results.stream()
                    .map(this::mapToTrackDTO)
                    .toList();

            Integer total = (Integer) response.get("total");
            return new PageImpl<>(tracks, pageable, total != null ? total : 0);
        } catch (Exception e) {
            log.error("Error fetching tracks from Jamendo: ", e);
            return new PageImpl<>(new ArrayList<>(), pageable, 0);
        }
    }

    @Override
    public TrackDTO getTrackById(String jamendoId) {
        String url = UriComponentsBuilder.fromHttpUrl(jamendoApiUrl + "/tracks/" + jamendoId)
                .queryParam("client_id", clientId)
                .queryParam("format", "json")
                .build()
                .toUriString();

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) {
                return null;
            }
            return mapToTrackDTO(response);
        } catch (Exception e) {
            log.error("Error fetching track from Jamendo: ", e);
            return null;
        }
    }

    private TrackDTO mapToTrackDTO(Map<String, Object> data) {
        try {
            TrackDTO dto = new TrackDTO();
            dto.setJamendoId((String) data.get("id"));
            dto.setTitle((String) data.get("name"));
            dto.setArtist((String) data.get("artist_name"));
            
            // Improved genre extraction from tags
            String tags = (String) data.get("tags");
            String genre = extractGenreFromTags(tags);
            dto.setGenre(genre);
            
            Object duration = data.get("duration");
            if (duration != null) {
                dto.setDuration(duration instanceof Integer ? (Integer) duration : Integer.parseInt(duration.toString()));
            }
            
            dto.setAudioUrl((String) data.get("audio"));
            dto.setImageUrl((String) data.get("image"));

            return dto;
        } catch (Exception e) {
            log.error("Error mapping track data: ", e);
            return null;
        }
    }

    /**
     * Extract primary genre from Jamendo tags
     * Tags come as comma-separated string like "electronic,ambient,chillout"
     * We prioritize common music genres and take the first recognizable one
     */
    private String extractGenreFromTags(String tags) {
        if (tags == null || tags.trim().isEmpty()) {
            return null;
        }
        
        // Convert to lowercase and split by comma
        String[] tagArray = tags.toLowerCase().split(",");
        
        // Priority list of recognizable genres
        String[] recognizedGenres = {
            "rock", "pop", "electronic", "jazz", "classical", "ambient", 
            "folk", "blues", "country", "reggae", "hip-hop", "rap", 
            "dance", "techno", "house", "trance", "dubstep", "drum and bass",
            "indie", "alternative", "metal", "punk", "funk", "soul",
            "r&b", "gospel", "world", "latin", "experimental"
        };
        
        // Find first recognized genre in tags
        for (String tag : tagArray) {
            String cleanTag = tag.trim();
            for (String genre : recognizedGenres) {
                if (cleanTag.contains(genre) || genre.contains(cleanTag)) {
                    return genre;
                }
            }
        }
        
        // If no recognized genre found, return the first tag as fallback
        return tagArray[0].trim();
    }
} 