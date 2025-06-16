package com.musicsocial.service;

import com.musicsocial.dto.admin.SystemStatsDTO;
import com.musicsocial.dto.admin.UserManagementDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminService {
    
    // System Monitoring
    SystemStatsDTO getSystemStats();
    
    // User Management
    Page<UserManagementDTO> getAllUsersForAdmin(Pageable pageable);
    UserManagementDTO getUserDetailsForAdmin(Long userId);
    void updateUserRole(Long userId, String role);
    void deleteUser(Long userId);
    
    // Content Management
    void deleteTrackAsAdmin(Long trackId, Long adminId);
    void deletePlaylistAsAdmin(Long playlistId, Long adminId);
    
    // Utility methods
    boolean isAdmin(Long userId);
    void validateAdminAccess(Long userId);
} 