package com.musicsocial.mapper;

import com.musicsocial.domain.Comment;
import com.musicsocial.dto.comment.CommentDTO;
import com.musicsocial.dto.comment.CommentCreateDTO;
import com.musicsocial.dto.comment.CommentUpdateDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CommentMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "track", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "likedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Comment toEntity(CommentCreateDTO dto);

    @Mapping(target = "userId", source = "comment.user.id")
    @Mapping(target = "username", source = "comment.user.username")
    @Mapping(target = "trackId", source = "comment.track.id")
    @Mapping(target = "likesCount", expression = "java(comment.getLikedBy().size())")
    @Mapping(target = "isLiked", expression = "java(comment.getLikedBy().stream().anyMatch(user -> user.getId().equals(currentUserId)))")
    CommentDTO toDTO(Comment comment, Long currentUserId);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "track", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "likedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDTO(CommentUpdateDTO dto, @MappingTarget Comment entity);
} 