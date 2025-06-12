package com.musicsocial.repository;

import com.musicsocial.domain.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreference, Long> {
    Optional<UserPreference> findByUserId(Long userId);
    
    @Query("SELECT up FROM UserPreference up JOIN FETCH up.user WHERE up.user.id = :userId")
    Optional<UserPreference> findByUserIdWithUser(@Param("userId") Long userId);
} 