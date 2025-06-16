package com.musicsocial.repository;

import com.musicsocial.domain.Track;
import com.musicsocial.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface TrackRepository extends JpaRepository<Track, Long> {
    Page<Track> findByUserId(Long userId, Pageable pageable);
    
    @Query("SELECT t FROM Track t WHERE " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.artist) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.album) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.genre) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Track> search(String query, Pageable pageable);
    
    Page<Track> findByGenre(String genre, Pageable pageable);
    
    @Query("SELECT DISTINCT t.genre FROM Track t WHERE t.genre IS NOT NULL ORDER BY t.genre")
    List<String> findDistinctGenres();
    
    @Query("SELECT DISTINCT t.artist FROM Track t WHERE t.artist IS NOT NULL ORDER BY t.artist")
    List<String> findDistinctArtists();
    
    @Query("SELECT t FROM Track t WHERE t.user.username = :username")
    Page<Track> findByUserUsername(String username, Pageable pageable);
    
    @Query("SELECT t FROM Track t WHERE t.user.username = :username ORDER BY t.createdAt DESC")
    List<Track> findByUserUsernameOrderByCreatedAtDesc(String username);
    
    @Query("SELECT t FROM Track t ORDER BY t.playCount DESC")
    Page<Track> findMostPlayed(Pageable pageable);
    
    @Query("SELECT t FROM Track t ORDER BY t.playCount DESC")
    Page<Track> findTopRated(Pageable pageable);

    Optional<Track> findByJamendoId(String jamendoId);

    // Recommendation queries
    
    /**
     * Find tracks by artist excluding specific track IDs
     */
    List<Track> findByArtistIgnoreCaseAndIdNotIn(String artist, Set<Long> excludeIds);
    
    /**
     * Find tracks by genre excluding specific track IDs
     */
    List<Track> findByGenreIgnoreCaseAndIdNotIn(String genre, Set<Long> excludeIds);
    
    /**
     * Find tracks by artist
     */
    List<Track> findByArtistIgnoreCase(String artist);
    
    /**
     * Find tracks by genre
     */
    List<Track> findByGenreIgnoreCase(String genre);
    
    /**
     * Find tracks by multiple artists excluding specific track IDs
     */
    @Query("SELECT t FROM Track t WHERE LOWER(t.artist) IN :artists AND t.id NOT IN :excludeIds ORDER BY RAND()")
    List<Track> findByArtistInAndIdNotIn(@Param("artists") List<String> artists, @Param("excludeIds") Set<Long> excludeIds, Pageable pageable);
    
    /**
     * Find tracks by multiple genres excluding specific track IDs
     */
    @Query("SELECT t FROM Track t WHERE LOWER(t.genre) IN :genres AND t.id NOT IN :excludeIds ORDER BY RAND()")
    List<Track> findByGenreInAndIdNotInRandomOrder(@Param("genres") List<String> genres, @Param("excludeIds") Set<Long> excludeIds, Pageable pageable);
    
    /**
     * Find tracks by their IDs
     */
    Page<Track> findByIdIn(Set<Long> ids, Pageable pageable);

    // Admin queries
    Long countByCreatedAtAfter(LocalDateTime date);
    
    @Query("SELECT t, COUNT(lh) as totalPlays FROM Track t " +
           "LEFT JOIN ListeningHistory lh ON lh.track = t " +
           "GROUP BY t.id " +
           "ORDER BY totalPlays DESC")
    List<Object[]> findTopTracksByPlayCount();
    
    @Query("SELECT t.artist, COUNT(lh) as totalPlays, COUNT(DISTINCT t.id) as trackCount " +
           "FROM Track t " +
           "LEFT JOIN ListeningHistory lh ON lh.track = t " +
           "WHERE t.artist IS NOT NULL " +
           "GROUP BY t.artist " +
           "ORDER BY totalPlays DESC")
    List<Object[]> findTopArtistsByTotalPlays();
    
    @Query("SELECT CASE WHEN t.genre IS NULL OR TRIM(t.genre) = '' THEN 'No Genre' ELSE t.genre END as genreName, COUNT(t) " +
           "FROM Track t " +
           "GROUP BY CASE WHEN t.genre IS NULL OR TRIM(t.genre) = '' THEN 'No Genre' ELSE t.genre END " +
           "ORDER BY COUNT(t) DESC")
    List<Object[]> findTopGenresByTrackCount();
} 