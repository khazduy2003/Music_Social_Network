package com.musicsocial.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemStatsDTO {
    private Long totalUsers;
    private Long totalTracks;
    private Long totalPlaylists;
    private Long totalListeningHistory;
    
    // Top statistics
    private List<TopItemDTO> topTracks;
    private List<TopItemDTO> topArtists;
    private List<TopItemDTO> topGenres;
    private List<UserStatsDTO> topUsers;
    
    // Recent activity
    private Long newUsersThisWeek;
    private Long newTracksThisWeek;
    private Long newPlaylistsThisWeek;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopItemDTO {
        private String name;
        private Long count;
        private String additionalInfo;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStatsDTO {
        private Long id;
        private String username;
        private String email;
        private Long tracksCount;
        private Long playlistsCount;
        private Long followersCount;
        private String role;
    }
} 