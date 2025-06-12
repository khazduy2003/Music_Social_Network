package com.musicsocial.service.impl;

import com.musicsocial.service.AuthService;
import com.musicsocial.service.UserService;
import com.musicsocial.service.JwtService;
import com.musicsocial.dto.auth.LoginDTO;
import com.musicsocial.dto.auth.RegisterDTO;
import com.musicsocial.dto.auth.AuthResponse;
import com.musicsocial.dto.user.UserDTO;
import com.musicsocial.dto.user.UserCreateDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final JwtService jwtService;

    @Override
    public UserDTO register(RegisterDTO registerDTO) {
        log.info("Processing registration for user: {}", registerDTO.getUsername());
        
        // Validate password match
        if (!registerDTO.getPassword().equals(registerDTO.getConfirmPassword())) {
            log.warn("Password mismatch for user: {}", registerDTO.getUsername());
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Convert RegisterDTO to UserCreateDTO
        UserCreateDTO userCreateDTO = new UserCreateDTO();
        userCreateDTO.setUsername(registerDTO.getUsername());
        userCreateDTO.setEmail(registerDTO.getEmail());
        userCreateDTO.setPassword(registerDTO.getPassword());

        log.info("Creating user with data: {}", userCreateDTO);
        return userService.createUser(userCreateDTO);
    }

    @Override
    public UserDTO login(LoginDTO loginDTO) {
        log.info("Processing login for user: {}", loginDTO.getUsername());
        
        // Get user by username
        UserDTO user = userService.getUserByUsername(loginDTO.getUsername());
        
        // TODO: Add password validation here if needed
        
        log.info("Login successful for user: {}", user.getUsername());
        return user;
    }

    @Override
    public AuthResponse loginWithToken(LoginDTO loginDTO) {
        UserDTO user = login(loginDTO);
        String token = jwtService.generateToken(user);
        return new AuthResponse(user, token);
    }
} 