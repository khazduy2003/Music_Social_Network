package com.musicsocial.dto.playlist;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PlaylistUpdateDTO {
    @NotBlank(message = "Name is required")
    private String name;

    private String description;
    private String coverImageUrl;
    private boolean isPublic;
} 