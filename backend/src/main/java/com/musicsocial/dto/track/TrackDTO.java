package com.musicsocial.dto.track;

import com.musicsocial.dto.user.UserDTO;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class TrackDTO {
    private Long id;
    private String jamendoId;
    private String title;
    private String artist;
    private String album;
    private String genre;
    private String coverImageUrl;
    private String audioUrl;
    private Integer duration;
    private UserDTO user;
    private Set<UserDTO> likedBy;
    private Integer playCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String imageUrl;
    private Integer likeCount;
    private String username;
    private Boolean isLiked;
} 