package com.musicsocial.controller;

import com.musicsocial.dto.user.UserDTO;
import com.musicsocial.dto.auth.RegisterDTO;
import com.musicsocial.dto.auth.LoginDTO;
import com.musicsocial.dto.auth.AuthResponse;
import com.musicsocial.service.AuthService;
import com.musicsocial.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

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
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterDTO registerDTO) {
        UserDTO user = authService.register(registerDTO);
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(user, token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginDTO loginDTO) {
        UserDTO user = authService.login(loginDTO);
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(user, token));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("Logged out successfully");
    }
}
