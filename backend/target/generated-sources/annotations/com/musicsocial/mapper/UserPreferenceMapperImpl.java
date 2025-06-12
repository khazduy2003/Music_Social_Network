package com.musicsocial.mapper;

import com.musicsocial.domain.User;
import com.musicsocial.domain.UserPreference;
import com.musicsocial.dto.preference.UserPreferenceDTO;
import java.util.LinkedHashSet;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-06-13T00:23:33+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.15 (Oracle Corporation)"
)
@Component
public class UserPreferenceMapperImpl implements UserPreferenceMapper {

    @Override
    public UserPreferenceDTO toDTO(UserPreference userPreference) {
        if ( userPreference == null ) {
            return null;
        }

        UserPreferenceDTO userPreferenceDTO = new UserPreferenceDTO();

        userPreferenceDTO.setUserId( userPreferenceUserId( userPreference ) );
        userPreferenceDTO.setId( userPreference.getId() );
        Set<String> set = userPreference.getPreferredGenres();
        if ( set != null ) {
            userPreferenceDTO.setPreferredGenres( new LinkedHashSet<String>( set ) );
        }
        Set<String> set1 = userPreference.getPreferredArtists();
        if ( set1 != null ) {
            userPreferenceDTO.setPreferredArtists( new LinkedHashSet<String>( set1 ) );
        }
        userPreferenceDTO.setCreatedAt( userPreference.getCreatedAt() );
        userPreferenceDTO.setUpdatedAt( userPreference.getUpdatedAt() );

        return userPreferenceDTO;
    }

    @Override
    public UserPreference toEntity(UserPreferenceDTO dto) {
        if ( dto == null ) {
            return null;
        }

        UserPreference userPreference = new UserPreference();

        userPreference.setId( dto.getId() );
        Set<String> set = dto.getPreferredGenres();
        if ( set != null ) {
            userPreference.setPreferredGenres( new LinkedHashSet<String>( set ) );
        }
        Set<String> set1 = dto.getPreferredArtists();
        if ( set1 != null ) {
            userPreference.setPreferredArtists( new LinkedHashSet<String>( set1 ) );
        }
        userPreference.setCreatedAt( dto.getCreatedAt() );
        userPreference.setUpdatedAt( dto.getUpdatedAt() );

        return userPreference;
    }

    private Long userPreferenceUserId(UserPreference userPreference) {
        if ( userPreference == null ) {
            return null;
        }
        User user = userPreference.getUser();
        if ( user == null ) {
            return null;
        }
        Long id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
