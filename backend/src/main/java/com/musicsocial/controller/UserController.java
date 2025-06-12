package com.musicsocial.controller;

import com.musicsocial.dto.user.UserDTO;
import com.musicsocial.dto.user.UserCreateDTO;
import com.musicsocial.dto.user.UserUpdateDTO;
import com.musicsocial.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {
    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/{id}/with-follow-status")
    public ResponseEntity<UserDTO> getUserWithFollowStatus(
            @PathVariable Long id,
            @RequestParam(required = false) Long currentUserId) {
        return ResponseEntity.ok(userService.getUserWithFollowStatus(id, currentUserId));
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @GetMapping
    public ResponseEntity<Page<UserDTO>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<UserDTO>> getAllUsersPaginated(Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserCreateDTO userCreateDTO) {
        return ResponseEntity.ok(userService.createUser(userCreateDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserUpdateDTO userUpdateDTO) {
        return ResponseEntity.ok(userService.updateUser(id, userUpdateDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    // Current user follow endpoints
    @PostMapping("/current/follow/{followingId}")
    public ResponseEntity<Void> followUserByCurrent(
            @PathVariable Long followingId,
            @RequestParam Long currentUserId) {
        userService.followUser(currentUserId, followingId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/current/follow/{followingId}")
    public ResponseEntity<Void> unfollowUserByCurrent(
            @PathVariable Long followingId,
            @RequestParam Long currentUserId) {
        userService.unfollowUser(currentUserId, followingId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/current/is-following/{followingId}")
    public ResponseEntity<Boolean> isFollowingByCurrent(
            @PathVariable Long followingId,
            @RequestParam Long currentUserId) {
        return ResponseEntity.ok(userService.isFollowing(currentUserId, followingId));
    }

    // Original endpoints with specific follower/following IDs
    @PostMapping("/{followerId}/follow/{followingId}")
    public ResponseEntity<Void> followUser(@PathVariable Long followerId, @PathVariable Long followingId) {
        userService.followUser(followerId, followingId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{followerId}/follow/{followingId}")
    public ResponseEntity<Void> unfollowUser(@PathVariable Long followerId, @PathVariable Long followingId) {
        userService.unfollowUser(followerId, followingId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<Page<UserDTO>> getFollowers(@PathVariable String username, Pageable pageable) {
        return ResponseEntity.ok(userService.getFollowers(username, pageable));
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<Page<UserDTO>> getFollowing(@PathVariable String username, Pageable pageable) {
        return ResponseEntity.ok(userService.getFollowing(username, pageable));
    }

    @GetMapping("/{username}/followers/paginated")
    public ResponseEntity<Page<UserDTO>> getFollowersPaginated(@PathVariable String username, Pageable pageable) {
        return ResponseEntity.ok(userService.getFollowers(username, pageable));
    }

    @GetMapping("/{username}/following/paginated")
    public ResponseEntity<Page<UserDTO>> getFollowingPaginated(@PathVariable String username, Pageable pageable) {
        return ResponseEntity.ok(userService.getFollowing(username, pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<UserDTO>> searchUsers(
            @RequestParam String query,
            Pageable pageable) {
        return ResponseEntity.ok(userService.searchUsers(query, pageable));
    }

    @GetMapping("/{followerId}/is-following/{followingId}")
    public ResponseEntity<Boolean> isFollowing(
            @PathVariable Long followerId,
            @PathVariable Long followingId) {
        return ResponseEntity.ok(userService.isFollowing(followerId, followingId));
    }

    @GetMapping("/{id}/mutual-following")
    public ResponseEntity<List<UserDTO>> getMutualFollowingUsers(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getMutualFollowingUsers(id));
    }
} 