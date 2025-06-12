package com.musicsocial.controller;

import com.musicsocial.dto.user.UserDTO;
import com.musicsocial.dto.auth.RegisterDTO;
import com.musicsocial.dto.auth.LoginDTO;
import com.musicsocial.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import com.musicsocial.dto.auth.AuthResponse;
import com.musicsocial.service.JwtService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final ObjectMapper objectMapper;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDTO registerDTO) {
        try {
            log.info("Received registration request: {}", objectMapper.writeValueAsString(registerDTO));
            UserDTO userDTO = authService.register(registerDTO);
            String token = jwtService.generateToken(userDTO);
            AuthResponse response = new AuthResponse(userDTO, token);
            log.info("Registration successful for user: {}", userDTO.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Registration failed", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        try {
            log.info("Received login request for user: {}", loginDTO.getUsername());
            AuthResponse response = authService.loginWithToken(loginDTO); // Trả về user + token
            log.info("Login successful for user: {}", loginDTO.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
