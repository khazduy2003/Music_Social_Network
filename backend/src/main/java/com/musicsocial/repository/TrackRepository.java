package com.musicsocial.repository;

import com.musicsocial.domain.Track;
import com.musicsocial.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface TrackRepository extends JpaRepository<Track, Long> {
    Page<Track> findByUserUsername(String username, Pageable pageable);
    
    @Query("SELECT t FROM Track t WHERE " +
           "LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.artist) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(t.genre) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Track> search(String query, Pageable pageable);
    
    @Query("SELECT t FROM Track t WHERE t.genre = :genre")
    Page<Track> findByGenre(String genre, Pageable pageable);
    
    @Query("SELECT t FROM Track t WHERE t.genre IN :genres")
    Page<Track> findByGenreIn(List<String> genres, Pageable pageable);
    
    @Query("SELECT t FROM Track t WHERE t.user IN :users")
    Page<Track> findByUserIn(List<User> users, Pageable pageable);
    
    @Query("SELECT t FROM Track t WHERE t.genre IN :genres AND t.id NOT IN :excludeIds")
    Page<Track> findByGenreInAndIdNotIn(
        @Param("genres") List<String> genres,
        @Param("excludeIds") List<Long> excludeIds,
        Pageable pageable
    );

    @Query("SELECT t FROM Track t WHERE t.title LIKE %:query% OR t.artist LIKE %:query%")
    Page<Track> searchTracks(@Param("query") String query, Pageable pageable);
    
    @Query("SELECT t FROM Track t ORDER BY t.playCount DESC")
    Page<Track> findMostPlayed(Pageable pageable);
    
    @Query("SELECT t FROM Track t ORDER BY t.rating DESC")
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
} 