package com.musicsocial.service.impl;

import com.musicsocial.service.AuthService;
import com.musicsocial.service.UserService;
import com.musicsocial.service.JwtService;
import com.musicsocial.dto.auth.LoginDTO;
import com.musicsocial.dto.auth.RegisterDTO;
import com.musicsocial.dto.auth.AuthResponse;
import com.musicsocial.dto.user.UserDTO;
import com.musicsocial.dto.user.UserCreateDTO;
import com.musicsocial.domain.User;
import com.musicsocial.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    
    private static final String ADMIN_SECRET_KEY = "khanhduy2003";

    @Override
    public UserDTO register(RegisterDTO registerDTO) {
        log.info("Processing registration for user: {} with role: {}", registerDTO.getUsername(), registerDTO.getRole());
        
        // Validate password match
        if (!registerDTO.getPassword().equals(registerDTO.getConfirmPassword())) {
            log.warn("Password mismatch for user: {}", registerDTO.getUsername());
            throw new IllegalArgumentException("Passwords do not match");
        }

        // Validate admin secret key if role is ADMIN
        if ("ADMIN".equals(registerDTO.getRole())) {
            if (registerDTO.getSecretKey() == null || !ADMIN_SECRET_KEY.equals(registerDTO.getSecretKey())) {
                log.warn("Invalid admin secret key for user: {}", registerDTO.getUsername());
                throw new IllegalArgumentException("Invalid admin secret key");
            }
            log.info("Valid admin secret key provided for user: {}", registerDTO.getUsername());
        }

        // Check if user already exists
        if (userRepository.existsByUsername(registerDTO.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        
        if (userRepository.existsByEmail(registerDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Create user directly with role
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(registerDTO.getPassword()); // No encryption as requested
        user.setRole(registerDTO.getRole() != null ? registerDTO.getRole() : "USER");
        
        User savedUser = userRepository.save(user);
        log.info("User created successfully: {} with role: {}", savedUser.getUsername(), savedUser.getRole());
        
        // Convert to DTO
        UserDTO userDTO = new UserDTO();
        userDTO.setId(savedUser.getId());
        userDTO.setUsername(savedUser.getUsername());
        userDTO.setEmail(savedUser.getEmail());
        userDTO.setRole(savedUser.getRole());
        userDTO.setFollowersCount(0L);
        userDTO.setFollowingCount(0L);
        
        return userDTO;
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

    @Override
    public AuthResponse registerAdmin(RegisterDTO registerDTO) {
        log.info("Creating admin user: {}", registerDTO.getUsername());
        
        // Check if admin already exists
        if (userRepository.existsByUsername(registerDTO.getUsername())) {
            throw new IllegalArgumentException("Admin user already exists");
        }
        
        // Create admin user directly
        User adminUser = new User();
        adminUser.setUsername(registerDTO.getUsername());
        adminUser.setEmail(registerDTO.getEmail());
        adminUser.setPassword(registerDTO.getPassword()); // No encryption as requested
        adminUser.setRole("ADMIN");
        
        User savedAdmin = userRepository.save(adminUser);
        log.info("Admin user created successfully: {}", savedAdmin.getUsername());
        
        // Convert to DTO manually
        UserDTO adminDTO = new UserDTO();
        adminDTO.setId(savedAdmin.getId());
        adminDTO.setUsername(savedAdmin.getUsername());
        adminDTO.setEmail(savedAdmin.getEmail());
        adminDTO.setRole(savedAdmin.getRole());
        adminDTO.setFollowersCount(0L);
        adminDTO.setFollowingCount(0L);
        
        String token = jwtService.generateToken(adminDTO);
        return new AuthResponse(adminDTO, token);
    }
} 