package com.musicsocial.service.impl;

import com.musicsocial.domain.Comment;
import com.musicsocial.domain.Track;
import com.musicsocial.domain.User;
import com.musicsocial.dto.comment.CommentDTO;
import com.musicsocial.dto.comment.CommentCreateDTO;
import com.musicsocial.dto.comment.CommentUpdateDTO;
import com.musicsocial.exception.ResourceNotFoundException;
import com.musicsocial.mapper.CommentMapper;
import com.musicsocial.repository.CommentRepository;
import com.musicsocial.repository.TrackRepository;
import com.musicsocial.repository.UserRepository;
import com.musicsocial.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final TrackRepository trackRepository;
    private final UserRepository userRepository;
    private final CommentMapper commentMapper;

    @Override
    public CommentDTO createComment(Long trackId, CommentCreateDTO commentCreateDTO) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found with id: " + trackId));
        User user = userRepository.findById(commentCreateDTO.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + commentCreateDTO.getUserId()));

        Comment comment = commentMapper.toEntity(commentCreateDTO);
        comment.setTrack(track);
        comment.setUser(user);
        return commentMapper.toDTO(commentRepository.save(comment), user.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public CommentDTO getCommentById(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));
        return commentMapper.toDTO(comment, comment.getUser().getId());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentDTO> getCommentsByTrack(Long trackId, Pageable pageable) {
        return commentRepository.findByTrackId(trackId, pageable)
                .map(comment -> commentMapper.toDTO(comment, comment.getUser().getId()));
    }

    @Override
    public CommentDTO updateComment(Long id, CommentUpdateDTO commentUpdateDTO) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));
        
        commentMapper.updateEntityFromDTO(commentUpdateDTO, comment);
        return commentMapper.toDTO(commentRepository.save(comment), comment.getUser().getId());
    }

    @Override
    public void deleteComment(Long id) {
        if (!commentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Comment not found with id: " + id);
        }
        commentRepository.deleteById(id);
    }
} 