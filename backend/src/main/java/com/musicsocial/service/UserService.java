package com.musicsocial.service;

import com.musicsocial.dto.user.UserDTO;
import com.musicsocial.dto.user.UserCreateDTO;
import com.musicsocial.dto.user.UserUpdateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    UserDTO createUser(UserCreateDTO userCreateDTO);
    UserDTO getUserById(Long id);
    UserDTO getUserByUsername(String username);
    Page<UserDTO> getAllUsers(Pageable pageable);
    UserDTO updateUser(Long id, UserUpdateDTO userUpdateDTO);
    void deleteUser(Long id);
    void followUser(Long followerId, Long followingId);
    void unfollowUser(Long followerId, Long followingId);
    Page<UserDTO> getFollowers(String username, Pageable pageable);
    Page<UserDTO> getFollowing(String username, Pageable pageable);
    Page<UserDTO> searchUsers(String query, Pageable pageable);
    boolean isFollowing(Long followerId, Long followingId);
    UserDTO getUserWithFollowStatus(Long userId, Long currentUserId);
    
    /**
     * Get users who have mutual following relationship with the given user
     * These are users who the given user follows and who also follow the given user back
     */
    List<UserDTO> getMutualFollowingUsers(Long userId);
} 