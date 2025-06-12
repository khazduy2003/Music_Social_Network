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
    date = "2025-06-12T18:13:15+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.42.0.v20250514-1000, environment: Java 21.0.7 (Eclipse Adoptium)"
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
        userPreferenceDTO.setCreatedAt( userPreference.getCreatedAt() );
        userPreferenceDTO.setId( userPreference.getId() );
        Set<String> set = userPreference.getPreferredArtists();
        if ( set != null ) {
            userPreferenceDTO.setPreferredArtists( new LinkedHashSet<String>( set ) );
        }
        Set<String> set1 = userPreference.getPreferredGenres();
        if ( set1 != null ) {
            userPreferenceDTO.setPreferredGenres( new LinkedHashSet<String>( set1 ) );
        }
        userPreferenceDTO.setUpdatedAt( userPreference.getUpdatedAt() );

        return userPreferenceDTO;
    }

    @Override
    public UserPreference toEntity(UserPreferenceDTO dto) {
        if ( dto == null ) {
            return null;
        }

        UserPreference userPreference = new UserPreference();

        userPreference.setCreatedAt( dto.getCreatedAt() );
        userPreference.setId( dto.getId() );
        Set<String> set = dto.getPreferredArtists();
        if ( set != null ) {
            userPreference.setPreferredArtists( new LinkedHashSet<String>( set ) );
        }
        Set<String> set1 = dto.getPreferredGenres();
        if ( set1 != null ) {
            userPreference.setPreferredGenres( new LinkedHashSet<String>( set1 ) );
        }
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
