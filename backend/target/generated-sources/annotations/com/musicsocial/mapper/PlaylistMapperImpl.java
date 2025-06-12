package com.musicsocial.mapper;

import com.musicsocial.domain.Comment;
import com.musicsocial.domain.Playlist;
import com.musicsocial.domain.Track;
import com.musicsocial.domain.User;
import com.musicsocial.dto.comment.CommentDTO;
import com.musicsocial.dto.playlist.PlaylistCreateDTO;
import com.musicsocial.dto.playlist.PlaylistDTO;
import com.musicsocial.dto.playlist.PlaylistUpdateDTO;
import com.musicsocial.dto.track.TrackDTO;
import com.musicsocial.dto.user.UserDTO;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-06-12T18:13:16+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.42.0.v20250514-1000, environment: Java 21.0.7 (Eclipse Adoptium)"
)
@Component
public class PlaylistMapperImpl implements PlaylistMapper {

    @Override
    public Playlist toEntity(PlaylistCreateDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Playlist playlist = new Playlist();

        playlist.setCoverImageUrl( dto.getCoverImageUrl() );
        playlist.setDescription( dto.getDescription() );
        playlist.setIsPublic( dto.getIsPublic() );
        playlist.setName( dto.getName() );

        return playlist;
    }

    @Override
    public PlaylistDTO toDTO(Playlist playlist) {
        if ( playlist == null ) {
            return null;
        }

        PlaylistDTO playlistDTO = new PlaylistDTO();

        playlistDTO.setUser( userToUserDTO( playlist.getUser() ) );
        playlistDTO.setTracks( trackSetToTrackDTOSet( playlist.getTracks() ) );
        playlistDTO.setLikedBy( userSetToUserDTOSet1( playlist.getLikedBy() ) );
        playlistDTO.setPlayCount( playlist.getPlayCount() );
        playlistDTO.setCoverImageUrl( playlist.getCoverImageUrl() );
        playlistDTO.setCreatedAt( playlist.getCreatedAt() );
        playlistDTO.setDescription( playlist.getDescription() );
        playlistDTO.setId( playlist.getId() );
        playlistDTO.setName( playlist.getName() );
        playlistDTO.setUpdatedAt( playlist.getUpdatedAt() );

        return playlistDTO;
    }

    @Override
    public void updateEntityFromDTO(PlaylistUpdateDTO dto, Playlist playlist) {
        if ( dto == null ) {
            return;
        }

        playlist.setCoverImageUrl( dto.getCoverImageUrl() );
        playlist.setDescription( dto.getDescription() );
        playlist.setName( dto.getName() );
    }

    protected UserDTO userToUserDTO(User user) {
        if ( user == null ) {
            return null;
        }

        UserDTO userDTO = new UserDTO();

        userDTO.setBio( user.getBio() );
        userDTO.setCreatedAt( user.getCreatedAt() );
        userDTO.setEmail( user.getEmail() );
        userDTO.setFullName( user.getFullName() );
        userDTO.setId( user.getId() );
        userDTO.setUpdatedAt( user.getUpdatedAt() );
        userDTO.setUsername( user.getUsername() );

        return userDTO;
    }

    protected CommentDTO commentToCommentDTO(Comment comment) {
        if ( comment == null ) {
            return null;
        }

        CommentDTO commentDTO = new CommentDTO();

        commentDTO.setContent( comment.getContent() );
        commentDTO.setCreatedAt( comment.getCreatedAt() );
        commentDTO.setId( comment.getId() );
        commentDTO.setUpdatedAt( comment.getUpdatedAt() );

        return commentDTO;
    }

    protected List<CommentDTO> commentSetToCommentDTOList(Set<Comment> set) {
        if ( set == null ) {
            return null;
        }

        List<CommentDTO> list = new ArrayList<CommentDTO>( set.size() );
        for ( Comment comment : set ) {
            list.add( commentToCommentDTO( comment ) );
        }

        return list;
    }

    protected Set<UserDTO> userSetToUserDTOSet(Set<User> set) {
        if ( set == null ) {
            return null;
        }

        Set<UserDTO> set1 = new LinkedHashSet<UserDTO>( Math.max( (int) ( set.size() / .75f ) + 1, 16 ) );
        for ( User user : set ) {
            set1.add( userToUserDTO( user ) );
        }

        return set1;
    }

    protected TrackDTO trackToTrackDTO(Track track) {
        if ( track == null ) {
            return null;
        }

        TrackDTO trackDTO = new TrackDTO();

        trackDTO.setAlbum( track.getAlbum() );
        trackDTO.setArtist( track.getArtist() );
        trackDTO.setAudioUrl( track.getAudioUrl() );
        trackDTO.setAverageRating( track.getAverageRating() );
        trackDTO.setComments( commentSetToCommentDTOList( track.getComments() ) );
        trackDTO.setCoverImageUrl( track.getCoverImageUrl() );
        trackDTO.setCreatedAt( track.getCreatedAt() );
        trackDTO.setDuration( track.getDuration() );
        trackDTO.setGenre( track.getGenre() );
        trackDTO.setId( track.getId() );
        trackDTO.setJamendoId( track.getJamendoId() );
        trackDTO.setLikedBy( userSetToUserDTOSet( track.getLikedBy() ) );
        trackDTO.setPlayCount( track.getPlayCount() );
        trackDTO.setRating( track.getRating() );
        trackDTO.setRatingCount( track.getRatingCount() );
        trackDTO.setTitle( track.getTitle() );
        trackDTO.setUpdatedAt( track.getUpdatedAt() );
        trackDTO.setUser( userToUserDTO( track.getUser() ) );

        return trackDTO;
    }

    protected Set<TrackDTO> trackSetToTrackDTOSet(Set<Track> set) {
        if ( set == null ) {
            return null;
        }

        Set<TrackDTO> set1 = new LinkedHashSet<TrackDTO>( Math.max( (int) ( set.size() / .75f ) + 1, 16 ) );
        for ( Track track : set ) {
            set1.add( trackToTrackDTO( track ) );
        }

        return set1;
    }

    protected Set<UserDTO> userSetToUserDTOSet1(Set<User> set) {
        if ( set == null ) {
            return null;
        }

        Set<UserDTO> set1 = new LinkedHashSet<UserDTO>( Math.max( (int) ( set.size() / .75f ) + 1, 16 ) );
        for ( User user : set ) {
            set1.add( userToUserDTO( user ) );
        }

        return set1;
    }
}
