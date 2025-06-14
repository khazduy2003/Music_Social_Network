package com.musicsocial.mapper;

import com.musicsocial.domain.Comment;
import com.musicsocial.domain.Track;
import com.musicsocial.domain.User;
import com.musicsocial.dto.comment.CommentCreateDTO;
import com.musicsocial.dto.comment.CommentDTO;
import com.musicsocial.dto.comment.CommentUpdateDTO;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-06-14T11:49:06+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.15 (Oracle Corporation)"
)
@Component
public class CommentMapperImpl implements CommentMapper {

    @Override
    public Comment toEntity(CommentCreateDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Comment comment = new Comment();

        comment.setContent( dto.getContent() );

        return comment;
    }

    @Override
    public CommentDTO toDTO(Comment comment, Long currentUserId) {
        if ( comment == null && currentUserId == null ) {
            return null;
        }

        CommentDTO commentDTO = new CommentDTO();

        if ( comment != null ) {
            commentDTO.setUserId( commentUserId( comment ) );
            commentDTO.setUsername( commentUserUsername( comment ) );
            commentDTO.setTrackId( commentTrackId( comment ) );
            commentDTO.setId( comment.getId() );
            commentDTO.setContent( comment.getContent() );
            commentDTO.setCreatedAt( comment.getCreatedAt() );
            commentDTO.setUpdatedAt( comment.getUpdatedAt() );
        }
        commentDTO.setLikesCount( comment.getLikedBy().size() );
        commentDTO.setIsLiked( comment.getLikedBy().stream().anyMatch(user -> user.getId().equals(currentUserId)) );

        return commentDTO;
    }

    @Override
    public void updateEntityFromDTO(CommentUpdateDTO dto, Comment entity) {
        if ( dto == null ) {
            return;
        }

        entity.setContent( dto.getContent() );
    }

    private Long commentUserId(Comment comment) {
        if ( comment == null ) {
            return null;
        }
        User user = comment.getUser();
        if ( user == null ) {
            return null;
        }
        Long id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String commentUserUsername(Comment comment) {
        if ( comment == null ) {
            return null;
        }
        User user = comment.getUser();
        if ( user == null ) {
            return null;
        }
        String username = user.getUsername();
        if ( username == null ) {
            return null;
        }
        return username;
    }

    private Long commentTrackId(Comment comment) {
        if ( comment == null ) {
            return null;
        }
        Track track = comment.getTrack();
        if ( track == null ) {
            return null;
        }
        Long id = track.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
