package com.musicsocial.dto.notification;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationCreateDTO {
    private Long senderId; // Optional for system notifications
    
    @NotNull(message = "Receiver ID is required")
    private Long receiverId;
    
    @NotBlank(message = "Message is required")
    private String message;
    
    @NotBlank(message = "Notification type is required")
    private String type; // FOLLOW, LIKE, SHARE, SYSTEM
    
    private String itemType; // track, playlist, album, user
    
    private Long itemId;
} 