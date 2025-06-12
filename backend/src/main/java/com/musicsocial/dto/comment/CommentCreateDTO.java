package com.musicsocial.dto.comment;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;

@Data
public class CommentCreateDTO {
    @NotBlank(message = "Content is required")
    @Size(min = 1, max = 1000, message = "Content must be between 1 and 1000 characters")
    private String content;
    
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Track ID is required")
    private Long trackId;

    public Long getUserId() {
        return userId;
    }
} 