package com.musicsocial.mapper;

import com.musicsocial.dto.playlist.PlaylistDTO;
import com.musicsocial.dto.playlist.PlaylistCreateDTO;
import com.musicsocial.dto.playlist.PlaylistUpdateDTO;
import com.musicsocial.domain.Playlist;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", uses = {TrackMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PlaylistMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "tracks", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "likedBy", ignore = true)
    @Mapping(target = "playCount", ignore = true)
    Playlist toEntity(PlaylistCreateDTO dto);

    @Mapping(target = "user", source = "playlist.user")
    @Mapping(target = "tracks", source = "playlist.tracks")
    @Mapping(target = "likedBy", source = "playlist.likedBy")
    @Mapping(target = "playCount", source = "playlist.playCount")
    PlaylistDTO toDTO(Playlist playlist);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "tracks", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "likedBy", ignore = true)
    @Mapping(target = "playCount", ignore = true)
    void updateEntityFromDTO(PlaylistUpdateDTO dto, @MappingTarget Playlist playlist);
} 