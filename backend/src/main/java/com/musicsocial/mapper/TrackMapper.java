package com.musicsocial.mapper;

import com.musicsocial.dto.track.TrackDTO;
import com.musicsocial.dto.track.TrackCreateDTO;
import com.musicsocial.dto.track.TrackUpdateDTO;
import com.musicsocial.domain.Track;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", uses = {UserMapper.class, CommentMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TrackMapper {
    @Autowired
    CommentMapper commentMapper = null;

    @Mapping(target = "imageUrl", source = "track.coverImageUrl")
    @Mapping(target = "likeCount", expression = "java(track.getLikedBy().size())")
    @Mapping(target = "username", source = "track.user.username")
    @Mapping(target = "likedBy", source = "track.likedBy")
    @Mapping(target = "jamendoId", source = "track.jamendoId")
    @Mapping(target = "rating", source = "track.rating")
    @Mapping(target = "isLiked", expression = "java(currentUserId != null && track.getLikedBy().stream().anyMatch(user -> user.getId().equals(currentUserId)))")
    @Mapping(target = "comments", expression = "java(track.getComments().stream().map(comment -> commentMapper.toDTO(comment, currentUserId)).collect(java.util.stream.Collectors.toList()))")
    TrackDTO toDTO(Track track, Long currentUserId);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "likedBy", ignore = true)
    @Mapping(target = "playCount", ignore = true)
    @Mapping(target = "rating", ignore = true)
    @Mapping(target = "ratingCount", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "likedTracks", ignore = true)
    @Mapping(target = "playlists", ignore = true)
    @Mapping(target = "jamendoId", ignore = true)
    Track toEntity(TrackCreateDTO dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "likedBy", ignore = true)
    @Mapping(target = "playCount", ignore = true)
    @Mapping(target = "rating", ignore = true)
    @Mapping(target = "ratingCount", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "audioUrl", ignore = true)
    @Mapping(target = "duration", ignore = true)
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "likedTracks", ignore = true)
    @Mapping(target = "playlists", ignore = true)
    @Mapping(target = "jamendoId", ignore = true)
    void updateEntityFromDTO(TrackUpdateDTO dto, @MappingTarget Track track);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "likedBy", ignore = true)
    @Mapping(target = "playCount", ignore = true)
    @Mapping(target = "rating", ignore = true)
    @Mapping(target = "ratingCount", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "averageRating", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "likedTracks", ignore = true)
    @Mapping(target = "playlists", ignore = true)
    @Mapping(target = "jamendoId", source = "jamendoId")
    @Mapping(target = "title", source = "title")
    @Mapping(target = "artist", source = "artist")
    @Mapping(target = "genre", source = "genre")
    @Mapping(target = "coverImageUrl", source = "imageUrl")
    @Mapping(target = "audioUrl", source = "audioUrl")
    @Mapping(target = "duration", source = "duration")
    Track toEntity(TrackDTO dto);
} 