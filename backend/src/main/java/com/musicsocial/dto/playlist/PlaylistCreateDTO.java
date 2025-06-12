package com.musicsocial.dto.playlist;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PlaylistCreateDTO {
    @NotBlank(message = "Name is required")
    private String name;

    private String description;
    private String coverImageUrl;
    private Boolean isPublic = true;

    @NotNull(message = "User ID is required")
    private Long userId;

    public Long getUserId() {
        return userId;
    }
} 