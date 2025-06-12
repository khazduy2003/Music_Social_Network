package com.musicsocial.dto.playlist;

import com.musicsocial.dto.track.TrackDTO;
import com.musicsocial.dto.user.UserDTO;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class PlaylistDTO {
    private Long id;
    private String name;
    private String description;
    private String coverImageUrl;
    private boolean isPublic;
    private UserDTO user;
    private Set<TrackDTO> tracks;
    private Set<UserDTO> likedBy;
    private Integer playCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 