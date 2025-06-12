package com.musicsocial.controller;

import com.musicsocial.dto.comment.CommentDTO;
import com.musicsocial.dto.comment.CommentCreateDTO;
import com.musicsocial.dto.comment.CommentUpdateDTO;
import com.musicsocial.service.CommentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CommentController {
    private final CommentService commentService;

    @GetMapping("/track/{trackId}")
    public ResponseEntity<Page<CommentDTO>> getCommentsByTrack(
            @PathVariable Long trackId,
            Pageable pageable) {
        return ResponseEntity.ok(commentService.getCommentsByTrack(trackId, pageable));
    }

    @PostMapping("/track/{trackId}")
    public ResponseEntity<CommentDTO> createComment(
            @PathVariable Long trackId,
            @RequestBody CommentCreateDTO commentCreateDTO) {
        return ResponseEntity.ok(commentService.createComment(trackId, commentCreateDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable Long id,
            @RequestBody CommentUpdateDTO commentUpdateDTO) {
        return ResponseEntity.ok(commentService.updateComment(id, commentUpdateDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok().build();
    }
} 