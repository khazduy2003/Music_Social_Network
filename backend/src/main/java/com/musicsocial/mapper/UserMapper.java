package com.musicsocial.mapper;

import com.musicsocial.dto.user.UserDTO;
import com.musicsocial.dto.user.UserCreateDTO;
import com.musicsocial.dto.user.UserUpdateDTO;
import com.musicsocial.domain.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface UserMapper {
    @Mapping(target = "avatarUrl", source = "profileImageUrl")
    @Mapping(target = "followersCount", expression = "java(user.getFollowers().size())")
    @Mapping(target = "followingCount", expression = "java(user.getFollowing().size())")
    @Mapping(target = "isFollowing", ignore = true)
    UserDTO toDTO(User user);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "following", ignore = true)
    @Mapping(target = "followers", ignore = true)
    @Mapping(target = "likedTracks", ignore = true)
    @Mapping(target = "likedPlaylists", ignore = true)
    @Mapping(target = "preferences", ignore = true)
    @Mapping(target = "tracks", ignore = true)
    @Mapping(target = "playlists", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "role", ignore = true)
    User toEntity(UserCreateDTO dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "following", ignore = true)
    @Mapping(target = "followers", ignore = true)
    @Mapping(target = "likedTracks", ignore = true)
    @Mapping(target = "likedPlaylists", ignore = true)
    @Mapping(target = "preferences", ignore = true)
    @Mapping(target = "tracks", ignore = true)
    @Mapping(target = "playlists", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "role", ignore = true)
    void updateEntityFromDTO(UserUpdateDTO dto, @MappingTarget User user);
} 