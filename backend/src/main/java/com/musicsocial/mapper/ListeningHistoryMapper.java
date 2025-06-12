package com.musicsocial.mapper;

import com.musicsocial.domain.ListeningHistory;
import com.musicsocial.dto.history.ListeningHistoryDTO;
import com.musicsocial.dto.history.ListeningHistoryCreateDTO;
import com.musicsocial.dto.history.ListeningHistoryUpdateDTO;
import com.musicsocial.dto.track.TrackDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ListeningHistoryMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "track", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "playedAt", expression = "java(java.time.LocalDateTime.now())")
    ListeningHistory toEntity(ListeningHistoryCreateDTO dto);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "track", expression = "java(mapTrack(history.getTrack()))")
    ListeningHistoryDTO toDTO(ListeningHistory history);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "track", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "playedAt", ignore = true)
    void updateEntityFromDTO(ListeningHistoryUpdateDTO dto, @MappingTarget ListeningHistory history);

    default TrackDTO mapTrack(com.musicsocial.domain.Track track) {
        if (track == null) {
            return null;
        }
        TrackDTO dto = new TrackDTO();
        dto.setId(track.getId());
        dto.setTitle(track.getTitle());
        dto.setArtist(track.getArtist());
        dto.setAlbum(track.getAlbum());
        dto.setGenre(track.getGenre());
        dto.setDuration(track.getDuration());
        dto.setAudioUrl(track.getAudioUrl());
        dto.setImageUrl(track.getCoverImageUrl());
        dto.setPlayCount(track.getPlayCount());
        dto.setCreatedAt(track.getCreatedAt());
        dto.setUpdatedAt(track.getUpdatedAt());
        // Skip collections to avoid lazy loading
        return dto;
    }
} 