package com.musicsocial.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a share notification when a user shares content with another user
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareNotificationDTO {
    private Long senderId;
    private Long receiverId;
    private String itemType; // 'track', 'playlist', or 'album'
    private Long itemId;
    private String itemName; // Track title, playlist name, etc.
} 