package com.musicsocial.service;

import com.musicsocial.dto.auth.LoginDTO;
import com.musicsocial.dto.auth.RegisterDTO;
import com.musicsocial.dto.auth.AuthResponse;
import com.musicsocial.dto.user.UserDTO;

public interface AuthService {
    UserDTO register(RegisterDTO registerDTO);
    UserDTO login(LoginDTO loginDTO);
    AuthResponse loginWithToken(LoginDTO loginDTO);
}