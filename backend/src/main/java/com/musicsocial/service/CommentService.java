package com.musicsocial.service;

import com.musicsocial.dto.comment.CommentDTO;
import com.musicsocial.dto.comment.CommentCreateDTO;
import com.musicsocial.dto.comment.CommentUpdateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {
    CommentDTO createComment(Long trackId, CommentCreateDTO commentCreateDTO);
    CommentDTO getCommentById(Long id);
    Page<CommentDTO> getCommentsByTrack(Long trackId, Pageable pageable);
    CommentDTO updateComment(Long id, CommentUpdateDTO commentUpdateDTO);
    void deleteComment(Long id);
} 