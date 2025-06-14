package com.musicsocial.mapper;

import com.musicsocial.domain.Track;
import com.musicsocial.domain.User;
import com.musicsocial.dto.track.TrackCreateDTO;
import com.musicsocial.dto.track.TrackDTO;
import com.musicsocial.dto.track.TrackUpdateDTO;
import com.musicsocial.dto.user.UserDTO;
import java.util.LinkedHashSet;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-06-14T18:27:54+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.42.0.v20250514-1000, environment: Java 21.0.7 (Eclipse Adoptium)"
)
@Component
public class TrackMapperImpl implements TrackMapper {

    @Autowired
    private UserMapper userMapper;

    @Override
    public TrackDTO toDTO(Track track, Long currentUserId) {
        if ( track == null && currentUserId == null ) {
            return null;
        }

        TrackDTO trackDTO = new TrackDTO();

        if ( track != null ) {
            trackDTO.setImageUrl( track.getCoverImageUrl() );
            trackDTO.setUsername( trackUserUsername( track ) );
            trackDTO.setLikedBy( userSetToUserDTOSet( track.getLikedBy() ) );
            trackDTO.setJamendoId( track.getJamendoId() );
            trackDTO.setRating( track.getRating() );
            trackDTO.setAlbum( track.getAlbum() );
            trackDTO.setArtist( track.getArtist() );
            trackDTO.setAudioUrl( track.getAudioUrl() );
            trackDTO.setAverageRating( track.getAverageRating() );
            trackDTO.setCoverImageUrl( track.getCoverImageUrl() );
            trackDTO.setCreatedAt( track.getCreatedAt() );
            trackDTO.setDuration( track.getDuration() );
            trackDTO.setGenre( track.getGenre() );
            trackDTO.setId( track.getId() );
            trackDTO.setPlayCount( track.getPlayCount() );
            trackDTO.setRatingCount( track.getRatingCount() );
            trackDTO.setTitle( track.getTitle() );
            trackDTO.setUpdatedAt( track.getUpdatedAt() );
            trackDTO.setUser( userMapper.toDTO( track.getUser() ) );
        }
        trackDTO.setLikeCount( track.getLikedBy().size() );
        trackDTO.setIsLiked( currentUserId != null && track.getLikedBy().stream().anyMatch(user -> user.getId().equals(currentUserId)) );

        return trackDTO;
    }

    @Override
    public Track toEntity(TrackCreateDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Track track = new Track();

        track.setAlbum( dto.getAlbum() );
        track.setArtist( dto.getArtist() );
        track.setAudioUrl( dto.getAudioUrl() );
        track.setCoverImageUrl( dto.getCoverImageUrl() );
        track.setDuration( dto.getDuration() );
        track.setGenre( dto.getGenre() );
        track.setTitle( dto.getTitle() );

        return track;
    }

    @Override
    public void updateEntityFromDTO(TrackUpdateDTO dto, Track track) {
        if ( dto == null ) {
            return;
        }

        track.setAlbum( dto.getAlbum() );
        track.setArtist( dto.getArtist() );
        track.setCoverImageUrl( dto.getCoverImageUrl() );
        track.setGenre( dto.getGenre() );
        track.setTitle( dto.getTitle() );
    }

    @Override
    public Track toEntity(TrackDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Track track = new Track();

        track.setJamendoId( dto.getJamendoId() );
        track.setTitle( dto.getTitle() );
        track.setArtist( dto.getArtist() );
        track.setGenre( dto.getGenre() );
        track.setCoverImageUrl( dto.getImageUrl() );
        track.setAudioUrl( dto.getAudioUrl() );
        track.setDuration( dto.getDuration() );
        track.setAlbum( dto.getAlbum() );

        return track;
    }

    private String trackUserUsername(Track track) {
        if ( track == null ) {
            return null;
        }
        User user = track.getUser();
        if ( user == null ) {
            return null;
        }
        String username = user.getUsername();
        if ( username == null ) {
            return null;
        }
        return username;
    }

    protected Set<UserDTO> userSetToUserDTOSet(Set<User> set) {
        if ( set == null ) {
            return null;
        }

        Set<UserDTO> set1 = new LinkedHashSet<UserDTO>( Math.max( (int) ( set.size() / .75f ) + 1, 16 ) );
        for ( User user : set ) {
            set1.add( userMapper.toDTO( user ) );
        }

        return set1;
    }
}
