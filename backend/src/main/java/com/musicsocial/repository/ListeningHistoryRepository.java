package com.musicsocial.repository;

import com.musicsocial.domain.ListeningHistory;
import com.musicsocial.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Repository
public interface ListeningHistoryRepository extends JpaRepository<ListeningHistory, Long> {
    
    @Query("SELECT lh FROM ListeningHistory lh " +
           "JOIN FETCH lh.user " +
           "JOIN FETCH lh.track " +
           "WHERE lh.user.id = :userId " +
           "ORDER BY lh.createdAt DESC")
    Page<ListeningHistory> findByUserId(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT t, COUNT(lh) as playCount FROM ListeningHistory lh " +
           "JOIN lh.track t " +
           "WHERE lh.user.id = :userId " +
           "GROUP BY t.id " +
           "ORDER BY playCount DESC")
    List<Object[]> findMostListenedTracks(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT DISTINCT t, lh.playedAt FROM ListeningHistory lh " +
           "JOIN lh.track t " +
           "WHERE lh.user.id = :userId " +
           "ORDER BY lh.playedAt DESC")
    Page<Object[]> findRecentTracks(@Param("userId") Long userId, Pageable pageable);
    
    // Additional query methods for statistics
    @Query("SELECT COUNT(lh) FROM ListeningHistory lh WHERE lh.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(lh) FROM ListeningHistory lh " +
           "WHERE lh.user.id = :userId " +
           "AND lh.playedAt >= :fromDate")
    Long countByUserIdAndPlayedAtAfter(@Param("userId") Long userId, @Param("fromDate") LocalDateTime fromDate);

    Page<ListeningHistory> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<ListeningHistory> findByUserIdAndPlayedAtBetweenOrderByPlayedAtDesc(Long userId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    void deleteByUserId(Long userId);
    void deleteByUserIdAndTrackId(Long userId, Long trackId);
    Page<ListeningHistory> findByUserUsernameOrderByCreatedAtDesc(String username, Pageable pageable);

    @Query("SELECT DISTINCT t.genre FROM Track t " +
           "JOIN ListeningHistory lh ON lh.track = t " +
           "WHERE lh.user = :user " +
           "GROUP BY t.genre " +
           "ORDER BY COUNT(lh) DESC")
    Page<String> findTopGenresByUser(User user, Pageable pageable);

    // Recommendation queries
    
    /**
     * Get distinct artists from user's listening history with minimum duration
     */
    @Query("SELECT DISTINCT t.artist FROM ListeningHistory lh " +
           "JOIN lh.track t " +
           "WHERE lh.user.id = :userId " +
           "AND lh.duration >= :minDuration " +
           "AND t.artist IS NOT NULL " +
           "ORDER BY t.artist")
    List<String> findDistinctArtistsByUserIdAndMinDuration(@Param("userId") Long userId, @Param("minDuration") Integer minDuration);
    
    /**
     * Get distinct genres from user's listening history with minimum duration
     */
    @Query("SELECT DISTINCT t.genre FROM ListeningHistory lh " +
           "JOIN lh.track t " +
           "WHERE lh.user.id = :userId " +
           "AND lh.duration >= :minDuration " +
           "AND t.genre IS NOT NULL " +
           "ORDER BY t.genre")
    List<String> findDistinctGenresByUserIdAndMinDuration(@Param("userId") Long userId, @Param("minDuration") Integer minDuration);
    
    /**
     * Get distinct track IDs that user has listened to
     */
    @Query("SELECT DISTINCT lh.track.id FROM ListeningHistory lh " +
           "WHERE lh.user.id = :userId")
    Set<Long> findDistinctTrackIdsByUserId(@Param("userId") Long userId);
    
    /**
     * Get user's top artists by total listening time
     */
    @Query("SELECT t.artist, SUM(lh.duration) as totalDuration FROM ListeningHistory lh " +
           "JOIN lh.track t " +
           "WHERE lh.user.id = :userId " +
           "AND lh.duration >= :minDuration " +
           "AND t.artist IS NOT NULL " +
           "GROUP BY t.artist " +
           "ORDER BY totalDuration DESC")
    List<Object[]> findTopArtistsByUserIdAndMinDuration(@Param("userId") Long userId, @Param("minDuration") Integer minDuration, Pageable pageable);
    
    /**
     * Get user's top genres by total listening time
     */
    @Query("SELECT t.genre, SUM(lh.duration) as totalDuration FROM ListeningHistory lh " +
           "JOIN lh.track t " +
           "WHERE lh.user.id = :userId " +
           "AND lh.duration >= :minDuration " +
           "AND t.genre IS NOT NULL " +
           "GROUP BY t.genre " +
           "ORDER BY totalDuration DESC")
    List<Object[]> findTopGenresByUserIdAndMinDuration(@Param("userId") Long userId, @Param("minDuration") Integer minDuration, Pageable pageable);

    /**
     * Find listening history by user ID with minimum duration threshold
     */
    List<ListeningHistory> findByUserIdAndDurationGreaterThanOrderByCreatedAtDesc(Long userId, Integer minDuration);
} 