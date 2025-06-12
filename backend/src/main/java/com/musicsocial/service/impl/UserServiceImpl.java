package com.musicsocial.service.impl;

import com.musicsocial.domain.User;
import com.musicsocial.dto.user.UserDTO;
import com.musicsocial.dto.user.UserCreateDTO;
import com.musicsocial.dto.user.UserUpdateDTO;
import com.musicsocial.exception.ResourceNotFoundException;
import com.musicsocial.mapper.UserMapper;
import com.musicsocial.repository.UserRepository;
import com.musicsocial.service.UserService;
import com.musicsocial.service.NotificationService;
import com.musicsocial.dto.notification.NotificationCreateDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public UserDTO createUser(UserCreateDTO userCreateDTO) {
        log.info("Creating new user: {}", userCreateDTO.getUsername());
        
        if (userRepository.existsByUsername(userCreateDTO.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        
        if (userRepository.existsByEmail(userCreateDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        // Validate password
        if (userCreateDTO.getPassword() == null || userCreateDTO.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        // Create user entity
        User user = new User();
        user.setUsername(userCreateDTO.getUsername());
        user.setEmail(userCreateDTO.getEmail());
        user.setPassword(userCreateDTO.getPassword());
        user.setRole("USER");
        
        user = userRepository.save(user);
        
        log.info("User created successfully: {}", user.getUsername());
        return userMapper.toDTO(user);
    }

    @Override
    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(userMapper::toDTO)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Override
    public UserDTO getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(userMapper::toDTO)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Override
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(userMapper::toDTO);
    }

    @Override
    @Transactional
    public UserDTO updateUser(Long id, UserUpdateDTO userUpdateDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        userMapper.updateEntityFromDTO(userUpdateDTO, user);
        user = userRepository.save(user);
        
        return userMapper.toDTO(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Override
    public void followUser(Long followerId, Long followingId) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("Follower not found with id: " + followerId));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new ResourceNotFoundException("Following user not found with id: " + followingId));

        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("User cannot follow themselves");
        }

        follower.getFollowing().add(following);
        userRepository.save(follower);
        
        // Send notification to the followed user
        try {
            NotificationCreateDTO notificationDTO = NotificationCreateDTO.builder()
                    .senderId(followerId)
                    .receiverId(followingId)
                    .message(follower.getUsername() + " started following you")
                    .type("FOLLOW")
                    .itemType("user")
                    .itemId(followerId)
                    .build();
            notificationService.createNotification(notificationDTO);
        } catch (Exception e) {
            // Log error but don't fail the follow operation
            log.warn("Failed to send follow notification from {} to {}: {}", followerId, followingId, e.getMessage());
        }
    }

    @Override
    public void unfollowUser(Long followerId, Long followingId) {
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("Follower not found with id: " + followerId));
        User following = userRepository.findById(followingId)
                .orElseThrow(() -> new ResourceNotFoundException("Following user not found with id: " + followingId));

        follower.getFollowing().remove(following);
        userRepository.save(follower);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> getFollowers(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        List<UserDTO> followers = user.getFollowers().stream()
                .map(userMapper::toDTO)
                .toList();
        return toPage(followers, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> getFollowing(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        List<UserDTO> following = user.getFollowing().stream()
                .map(userMapper::toDTO)
                .toList();
        return toPage(following, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDTO> searchUsers(String query, Pageable pageable) {
        return userRepository.search(query, pageable).map(userMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFollowing(Long followerId, Long followingId) {
        if (followerId == null || followingId == null) {
            return false;
        }
        User follower = userRepository.findById(followerId).orElse(null);
        if (follower == null) {
            return false;
        }
        return follower.getFollowing().stream()
                .anyMatch(user -> user.getId().equals(followingId));
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getUserWithFollowStatus(Long userId, Long currentUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        UserDTO userDTO = userMapper.toDTO(user);
        userDTO.setIsFollowing(isFollowing(currentUserId, userId));
        
        return userDTO;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDTO> getMutualFollowingUsers(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return userRepository.findMutualFollowingUsers(userId).stream()
                .map(userMapper::toDTO)
                .collect(Collectors.toList());
    }

    private <T> Page<T> toPage(List<T> list, Pageable pageable) {
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), list.size());
        List<T> subList = (start > end) ? List.of() : list.subList(start, end);
        return new org.springframework.data.domain.PageImpl<>(subList, pageable, list.size());
    }
} 