package com.musicsocial.dto.track;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class TrackUploadDTO {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Artist is required")
    private String artist;

    private String album;
    private String genre;
    private String description;
    
    private MultipartFile audioFile;
    private MultipartFile coverImage;
} 