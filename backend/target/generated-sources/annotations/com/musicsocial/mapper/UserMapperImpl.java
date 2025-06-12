package com.musicsocial.mapper;

import com.musicsocial.domain.User;
import com.musicsocial.dto.user.UserCreateDTO;
import com.musicsocial.dto.user.UserDTO;
import com.musicsocial.dto.user.UserUpdateDTO;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-06-12T03:12:34+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.15 (Oracle Corporation)"
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
        userDTO.setId( user.getId() );
        userDTO.setUsername( user.getUsername() );
        userDTO.setEmail( user.getEmail() );
        userDTO.setFullName( user.getFullName() );
        userDTO.setBio( user.getBio() );
        userDTO.setCreatedAt( user.getCreatedAt() );
        userDTO.setUpdatedAt( user.getUpdatedAt() );

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

        user.setUsername( dto.getUsername() );
        user.setEmail( dto.getEmail() );

        return user;
    }

    @Override
    public void updateEntityFromDTO(UserUpdateDTO dto, User user) {
        if ( dto == null ) {
            return;
        }

        user.setFullName( dto.getFullName() );
        user.setBio( dto.getBio() );
    }
}
