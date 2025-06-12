package com.musicsocial.repository;

import com.musicsocial.domain.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByTrackId(Long trackId, Pageable pageable);
    Page<Comment> findByUserId(Long userId, Pageable pageable);
} 