package com.musicsocial.repository;

import com.musicsocial.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> search(String query, Pageable pageable);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<User> findByUsernameOrFullNameContainingIgnoreCase(String query, Pageable pageable);
    
    /**
     * Find users who have mutual following relationship with the given user
     * These are users who the given user follows and who also follow the given user back
     */
    @Query("SELECT u FROM User u JOIN u.followers f1 JOIN u.following f2 WHERE f1.id = :userId AND f2.id = :userId")
    List<User> findMutualFollowingUsers(Long userId);
} 