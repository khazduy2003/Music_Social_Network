package com.musicsocial.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserManagementDTO {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private Boolean isActive;
    private LocalDateTime createdAt;
    
    // Statistics
    private Long tracksCount;
    private Long playlistsCount;
    private Long followersCount;
    private Long followingCount;
    private Long totalListeningTime;
} 