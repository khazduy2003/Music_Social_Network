package com.musicsocial.dto.track;

import com.musicsocial.dto.user.UserDTO;
import com.musicsocial.dto.comment.CommentDTO;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.List;

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
    private Double averageRating;
    private Integer ratingCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String imageUrl;
    private Double rating;
    private Integer likeCount;
    private String username;
    private Boolean isLiked;
    private List<CommentDTO> comments;
} 