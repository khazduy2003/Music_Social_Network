package com.musicsocial.mapper;

import com.musicsocial.domain.User;
import com.musicsocial.dto.user.UserCreateDTO;
import com.musicsocial.dto.user.UserDTO;
import com.musicsocial.dto.user.UserUpdateDTO;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-06-16T17:18:21+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.15 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public UserDTO toDTO(User user) {
        if ( user == null ) {
            return null;
        }

        UserDTO.UserDTOBuilder userDTO = UserDTO.builder();

        userDTO.avatarUrl( user.getProfileImageUrl() );
        userDTO.id( user.getId() );
        userDTO.username( user.getUsername() );
        userDTO.email( user.getEmail() );
        userDTO.fullName( user.getFullName() );
        userDTO.bio( user.getBio() );
        userDTO.role( user.getRole() );
        userDTO.createdAt( user.getCreatedAt() );
        userDTO.updatedAt( user.getUpdatedAt() );

        userDTO.followersCount( (long)user.getFollowers().size() );
        userDTO.followingCount( (long)user.getFollowing().size() );

        return userDTO.build();
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
