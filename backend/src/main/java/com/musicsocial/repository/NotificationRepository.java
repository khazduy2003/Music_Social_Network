package com.musicsocial.repository;

import com.musicsocial.domain.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    /**
     * Find all notifications for a user ordered by creation date descending
     */
    Page<Notification> findByReceiverIdOrderByCreatedAtDesc(Long receiverId, Pageable pageable);
    
    /**
     * Count unread notifications for a user
     */
    Long countByReceiverIdAndReadFalse(Long receiverId);
} 