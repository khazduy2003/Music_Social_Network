package com.musicsocial.service;

import com.musicsocial.dto.notification.NotificationCreateDTO;
import com.musicsocial.dto.notification.NotificationDTO;
import com.musicsocial.dto.notification.ShareNotificationDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    /**
     * Get notifications for a specific user
     * @param userId the ID of the user
     * @param pageable pagination parameters
     * @return a page of notifications
     */
    Page<NotificationDTO> getUserNotifications(Long userId, Pageable pageable);
    
    /**
     * Get count of unread notifications for a user
     * @param userId the ID of the user
     * @return the count of unread notifications
     */
    Long getUnreadNotificationsCount(Long userId);
    
    /**
     * Create a new notification
     * @param notificationDTO the notification details
     * @return the created notification
     */
    NotificationDTO createNotification(NotificationCreateDTO notificationDTO);
    
    /**
     * Create a share notification when a user shares content with another user
     * @param shareDTO the share notification details
     * @return the created notification
     */
    NotificationDTO createShareNotification(ShareNotificationDTO shareDTO);
    
    /**
     * Mark a notification as read
     * @param id the ID of the notification
     * @return the updated notification
     */
    NotificationDTO markAsRead(Long id);
    
    /**
     * Delete a notification
     * @param id the ID of the notification
     */
    void deleteNotification(Long id);
} 