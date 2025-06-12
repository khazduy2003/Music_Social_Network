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
    date = "2025-06-13T00:23:34+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.15 (Oracle Corporation)"
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
            trackDTO.setId( track.getId() );
            trackDTO.setTitle( track.getTitle() );
            trackDTO.setArtist( track.getArtist() );
            trackDTO.setAlbum( track.getAlbum() );
            trackDTO.setGenre( track.getGenre() );
            trackDTO.setCoverImageUrl( track.getCoverImageUrl() );
            trackDTO.setAudioUrl( track.getAudioUrl() );
            trackDTO.setDuration( track.getDuration() );
            trackDTO.setUser( userMapper.toDTO( track.getUser() ) );
            trackDTO.setPlayCount( track.getPlayCount() );
            trackDTO.setAverageRating( track.getAverageRating() );
            trackDTO.setRatingCount( track.getRatingCount() );
            trackDTO.setCreatedAt( track.getCreatedAt() );
            trackDTO.setUpdatedAt( track.getUpdatedAt() );
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

        track.setTitle( dto.getTitle() );
        track.setArtist( dto.getArtist() );
        track.setAlbum( dto.getAlbum() );
        track.setGenre( dto.getGenre() );
        track.setCoverImageUrl( dto.getCoverImageUrl() );
        track.setAudioUrl( dto.getAudioUrl() );
        track.setDuration( dto.getDuration() );

        return track;
    }

    @Override
    public void updateEntityFromDTO(TrackUpdateDTO dto, Track track) {
        if ( dto == null ) {
            return;
        }

        track.setTitle( dto.getTitle() );
        track.setArtist( dto.getArtist() );
        track.setAlbum( dto.getAlbum() );
        track.setGenre( dto.getGenre() );
        track.setCoverImageUrl( dto.getCoverImageUrl() );
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
