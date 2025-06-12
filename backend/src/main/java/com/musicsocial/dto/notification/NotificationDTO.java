package com.musicsocial.dto.notification;

import com.musicsocial.dto.user.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private UserDTO sender; // Can be null for system notifications
    private UserDTO receiver;
    private String message;
    private String type;
    private String itemType;
    private Long itemId;
    private boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 