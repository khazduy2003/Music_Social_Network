package com.musicsocial.scheduler;

import com.musicsocial.domain.Track;
import com.musicsocial.mapper.TrackMapper;
import com.musicsocial.repository.TrackRepository;
import com.musicsocial.service.JamendoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JamendoDataScheduler {

    private final JamendoService jamendoService;
    private final TrackRepository trackRepository;
    private final TrackMapper trackMapper;

    @Scheduled(fixedRate = 3600000) // 1 hour = 3600000 milliseconds
    @Transactional
    public void fetchAndUpdateJamendoData() {
        try {
            log.info("Starting scheduled task to fetch Jamendo data...");
            
            // Fetch popular tracks
            var popularTracks = jamendoService.getPopularTracks(PageRequest.of(0, 50));
            updateTracks(popularTracks.getContent().stream()
                .map(trackMapper::toEntity)
                .toList());
            
            // Fetch tracks by different genres
            String[] genres = {"rock", "pop", "electronic", "jazz", "classical"};
            for (String genre : genres) {
                var genreTracks = jamendoService.getTracksByGenre(genre, PageRequest.of(0, 20));
                updateTracks(genreTracks.getContent().stream()
                    .map(trackMapper::toEntity)
                    .toList());
            }
            
            log.info("Successfully completed scheduled task to fetch Jamendo data");
        } catch (Exception e) {
            log.error("Error occurred while fetching Jamendo data: ", e);
        }
    }

    private void updateTracks(List<Track> tracks) {
        for (Track track : tracks) {
            try {
                // Check if track already exists by jamendoId
                trackRepository.findByJamendoId(track.getJamendoId())
                    .ifPresentOrElse(
                        existingTrack -> {
                            // Update existing track
                            existingTrack.setTitle(track.getTitle());
                            existingTrack.setArtist(track.getArtist());
                            existingTrack.setGenre(track.getGenre());
                            existingTrack.setCoverImageUrl(track.getCoverImageUrl());
                            existingTrack.setAudioUrl(track.getAudioUrl());
                            existingTrack.setDuration(track.getDuration());
                            trackRepository.save(existingTrack);
                        },
                        () -> {
                            // Save new track
                            trackRepository.save(track);
                        }
                    );
            } catch (Exception e) {
                log.error("Error updating track {}: ", track.getJamendoId(), e);
            }
        }
    }
} 