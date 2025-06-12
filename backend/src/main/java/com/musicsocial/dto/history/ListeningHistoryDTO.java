package com.musicsocial.dto.history;

import com.musicsocial.dto.track.TrackDTO;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ListeningHistoryDTO {
    private Long id;
    private Long userId;
    private String username;
    private TrackDTO track;
    private Integer duration;
    private LocalDateTime createdAt;
    private LocalDateTime playedAt;
    private LocalDateTime updatedAt;
} 