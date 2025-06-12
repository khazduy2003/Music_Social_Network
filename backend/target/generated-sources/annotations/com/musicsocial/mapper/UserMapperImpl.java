package com.musicsocial.mapper;

import com.musicsocial.domain.User;
import com.musicsocial.dto.user.UserCreateDTO;
import com.musicsocial.dto.user.UserDTO;
import com.musicsocial.dto.user.UserUpdateDTO;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-06-12T18:13:17+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.42.0.v20250514-1000, environment: Java 21.0.7 (Eclipse Adoptium)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDTO toDTO(User user) {
        if ( user == null ) {
            return null;
        }

        UserDTO userDTO = new UserDTO();

        userDTO.setAvatarUrl( user.getProfileImageUrl() );
        userDTO.setBio( user.getBio() );
        userDTO.setCreatedAt( user.getCreatedAt() );
        userDTO.setEmail( user.getEmail() );
        userDTO.setFullName( user.getFullName() );
        userDTO.setId( user.getId() );
        userDTO.setUpdatedAt( user.getUpdatedAt() );
        userDTO.setUsername( user.getUsername() );

        userDTO.setFollowersCount( user.getFollowers().size() );
        userDTO.setFollowingCount( user.getFollowing().size() );

        return userDTO;
    }

    @Override
    public User toEntity(UserCreateDTO dto) {
        if ( dto == null ) {
            return null;
        }

        User user = new User();

        user.setEmail( dto.getEmail() );
        user.setUsername( dto.getUsername() );

        return user;
    }

    @Override
    public void updateEntityFromDTO(UserUpdateDTO dto, User user) {
        if ( dto == null ) {
            return;
        }

        user.setBio( dto.getBio() );
        user.setFullName( dto.getFullName() );
    }
}
