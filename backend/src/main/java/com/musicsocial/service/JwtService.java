package com.musicsocial.service;

import com.musicsocial.dto.user.UserDTO;

public interface JwtService {
    String generateToken(UserDTO user);
    String getUsernameFromToken(String token);
    boolean validateToken(String token);
} 