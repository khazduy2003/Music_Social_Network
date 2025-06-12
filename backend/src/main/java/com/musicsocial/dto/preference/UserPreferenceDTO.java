package com.musicsocial.dto.preference;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class UserPreferenceDTO {
    private Long id;
    private Long userId;
    private Set<String> preferredGenres;
    private Set<String> preferredArtists;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 