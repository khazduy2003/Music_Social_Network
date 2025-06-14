package com.musicsocial.dto.auth;

import lombok.Data;

@Data
public class RegisterDTO {
    private String username;
    private String email;
    private String password;
    private String confirmPassword;
    private String role = "USER"; // Default role is USER
    private String secretKey; // Required only for ADMIN role
} 