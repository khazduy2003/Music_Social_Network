package com.musicsocial.mapper;

import com.musicsocial.domain.User;
import com.musicsocial.dto.user.UserCreateDTO;
import com.musicsocial.dto.user.UserDTO;
import com.musicsocial.dto.user.UserUpdateDTO;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-06-14T18:27:55+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.42.0.v20250514-1000, environment: Java 21.0.7 (Eclipse Adoptium)"
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
        userDTO.bio( user.getBio() );
        userDTO.createdAt( user.getCreatedAt() );
        userDTO.email( user.getEmail() );
        userDTO.fullName( user.getFullName() );
        userDTO.id( user.getId() );
        userDTO.role( user.getRole() );
        userDTO.updatedAt( user.getUpdatedAt() );
        userDTO.username( user.getUsername() );

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
