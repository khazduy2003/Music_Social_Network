package com.musicsocial.repository;

import com.musicsocial.domain.Playlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    Page<Playlist> findByUserUsername(String username, Pageable pageable);
    Page<Playlist> findByIsPublicTrue(Pageable pageable);
    List<Playlist> findByUserId(Long userId);
    
    @Query("SELECT p FROM Playlist p ORDER BY p.playCount DESC")
    Page<Playlist> findMostPlayed(Pageable pageable);

    
    @Query("SELECT p FROM Playlist p WHERE p.isPublic = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Playlist> searchPublicPlaylists(String keyword, Pageable pageable);
} 