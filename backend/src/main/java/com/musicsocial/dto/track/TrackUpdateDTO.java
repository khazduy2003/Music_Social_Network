package com.musicsocial.dto.track;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TrackUpdateDTO {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Artist is required")
    private String artist;

    private String album;
    private String genre;
    private String coverImageUrl;
} 