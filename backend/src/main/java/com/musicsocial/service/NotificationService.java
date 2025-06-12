package com.musicsocial.service;

import com.musicsocial.domain.User;
import com.musicsocial.domain.Track;
import com.musicsocial.domain.Playlist;
import com.musicsocial.dto.notification.NotificationCreateDTO;
import com.musicsocial.dto.notification.NotificationDTO;
import com.musicsocial.dto.notification.ShareNotificationDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service to handle all notification operations including activity-based notifications
 */
public interface NotificationService {
    
    // Basic notification operations
    /**
     * Get notifications for a specific user
     */
    Page<NotificationDTO> getUserNotifications(Long userId, Pageable pageable);
    
    /**
     * Get count of unread notifications for a user
     */
    Long getUnreadNotificationsCount(Long userId);
    
    /**
     * Create a new notification
     */
    NotificationDTO createNotification(NotificationCreateDTO notificationDTO);
    
    /**
     * Create a share notification when a user shares content with another user
     */
    NotificationDTO createShareNotification(ShareNotificationDTO shareDTO);
    
    /**
     * Mark a notification as read
     */
    NotificationDTO markAsRead(Long id);
    
    /**
     * Delete a notification
     */
    void deleteNotification(Long id);
    
    // Activity-based notification methods
    /**
     * Send notification when a user follows another user
     */
    void sendFollowNotification(User follower, User following);
    
    /**
     * Send notification when a user likes a track
     */
    void sendTrackLikeNotification(User liker, Track track);
    
    /**
     * Send notification when a user likes a playlist
     */
    void sendPlaylistLikeNotification(User liker, Playlist playlist);
    
    // Helper methods with IDs
    /**
     * Send follow notification using user IDs
     */
    void sendFollowNotification(Long followerId, Long followingId);
    
    /**
     * Send track like notification using IDs
     */
    void sendTrackLikeNotification(Long likerId, Long trackId);
    
    /**
     * Send playlist like notification using IDs
     */
    void sendPlaylistLikeNotification(Long likerId, Long playlistId);
} 