package com.musicsocial.service.impl;

import com.musicsocial.domain.User;
import com.musicsocial.domain.Track;
import com.musicsocial.domain.Playlist;
import com.musicsocial.domain.Notification;
import com.musicsocial.service.NotificationService;
import com.musicsocial.dto.notification.NotificationCreateDTO;
import com.musicsocial.dto.notification.NotificationDTO;
import com.musicsocial.dto.notification.ShareNotificationDTO;
import com.musicsocial.exception.ResourceNotFoundException;
import com.musicsocial.mapper.NotificationMapper;
import com.musicsocial.repository.NotificationRepository;
import com.musicsocial.repository.UserRepository;
import com.musicsocial.repository.TrackRepository;
import com.musicsocial.repository.PlaylistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final TrackRepository trackRepository;
    private final PlaylistRepository playlistRepository;
    private final NotificationMapper notificationMapper;

    // Basic notification operations
    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getUserNotifications(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return notificationRepository.findByReceiverIdOrderByCreatedAtDesc(userId, pageable)
                .map(notificationMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadNotificationsCount(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return notificationRepository.countByReceiverIdAndReadFalse(userId);
    }

    @Override
    @Transactional
    public NotificationDTO createNotification(NotificationCreateDTO notificationDTO) {
        User receiver = userRepository.findById(notificationDTO.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        Notification notification = Notification.builder()
                .message(notificationDTO.getMessage())
                .type(notificationDTO.getType())
                .read(false)
                .createdAt(LocalDateTime.now())
                .receiver(receiver)
                .build();

        // Set sender if present
        if (notificationDTO.getSenderId() != null) {
            User sender = userRepository.findById(notificationDTO.getSenderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
            notification.setSender(sender);
        }

        // Set related item fields if present
        notification.setItemId(notificationDTO.getItemId());
        notification.setItemType(notificationDTO.getItemType());

        return notificationMapper.toDTO(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public NotificationDTO createShareNotification(ShareNotificationDTO shareDTO) {
        User sender = userRepository.findById(shareDTO.getSenderId())
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        
        User receiver = userRepository.findById(shareDTO.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        String itemTypeCapitalized = shareDTO.getItemType().substring(0, 1).toUpperCase() + 
                                     shareDTO.getItemType().substring(1);
        
        String message = sender.getUsername() + " shared " + itemTypeCapitalized + 
                         " \"" + shareDTO.getItemName() + "\" with you";

        Notification notification = Notification.builder()
                .message(message)
                .type("SHARE")
                .read(false)
                .createdAt(LocalDateTime.now())
                .sender(sender)
                .receiver(receiver)
                .itemId(shareDTO.getItemId())
                .itemType(shareDTO.getItemType())
                .build();

        return notificationMapper.toDTO(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public NotificationDTO markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        
        notification.setRead(true);
        return notificationMapper.toDTO(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification not found with id: " + id);
        }
        notificationRepository.deleteById(id);
    }

    // Activity-based notification methods
    @Override
    public void sendFollowNotification(User follower, User following) {
        try {
            NotificationCreateDTO notificationDTO = NotificationCreateDTO.builder()
                    .senderId(follower.getId())
                    .receiverId(following.getId())
                    .message(follower.getUsername() + " started following you")
                    .type("FOLLOW")
                    .itemType("user")
                    .itemId(follower.getId())
                    .build();
            createNotification(notificationDTO);
            log.info("Follow notification sent from {} to {}", follower.getUsername(), following.getUsername());
        } catch (Exception e) {
            log.warn("Failed to send follow notification from {} to {}: {}", 
                follower.getUsername(), following.getUsername(), e.getMessage());
        }
    }

    @Override
    public void sendTrackLikeNotification(User liker, Track track) {
        // Don't send notification if user likes their own track
        if (liker.getId().equals(track.getUser().getId())) {
            return;
        }
        
        try {
            NotificationCreateDTO notificationDTO = NotificationCreateDTO.builder()
                    .senderId(liker.getId())
                    .receiverId(track.getUser().getId())
                    .message(liker.getUsername() + " liked your track \"" + track.getTitle() + "\"")
                    .type("LIKE")
                    .itemType("track")
                    .itemId(track.getId())
                    .build();
            createNotification(notificationDTO);
            log.info("Track like notification sent from {} to {} for track {}", 
                liker.getUsername(), track.getUser().getUsername(), track.getTitle());
        } catch (Exception e) {
            log.warn("Failed to send track like notification from {} to {} for track {}: {}", 
                liker.getUsername(), track.getUser().getUsername(), track.getTitle(), e.getMessage());
        }
    }

    @Override
    public void sendPlaylistLikeNotification(User liker, Playlist playlist) {
        // Don't send notification if user likes their own playlist
        if (liker.getId().equals(playlist.getUser().getId())) {
            return;
        }
        
        try {
            NotificationCreateDTO notificationDTO = NotificationCreateDTO.builder()
                    .senderId(liker.getId())
                    .receiverId(playlist.getUser().getId())
                    .message(liker.getUsername() + " liked your playlist \"" + playlist.getName() + "\"")
                    .type("LIKE")
                    .itemType("playlist")
                    .itemId(playlist.getId())
                    .build();
            createNotification(notificationDTO);
            log.info("Playlist like notification sent from {} to {} for playlist {}", 
                liker.getUsername(), playlist.getUser().getUsername(), playlist.getName());
        } catch (Exception e) {
            log.warn("Failed to send playlist like notification from {} to {} for playlist {}: {}", 
                liker.getUsername(), playlist.getUser().getUsername(), playlist.getName(), e.getMessage());
        }
    }

    // Helper methods với IDs
    @Override
    public void sendFollowNotification(Long followerId, Long followingId) {
        try {
            User follower = userRepository.findById(followerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Follower not found"));
            User following = userRepository.findById(followingId)
                    .orElseThrow(() -> new ResourceNotFoundException("Following user not found"));
            sendFollowNotification(follower, following);
        } catch (Exception e) {
            log.warn("Failed to send follow notification from {} to {}: {}", followerId, followingId, e.getMessage());
        }
    }

    @Override
    public void sendTrackLikeNotification(Long likerId, Long trackId) {
        try {
            User liker = userRepository.findById(likerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Liker not found"));
            Track track = trackRepository.findById(trackId)
                    .orElseThrow(() -> new ResourceNotFoundException("Track not found"));
            sendTrackLikeNotification(liker, track);
        } catch (Exception e) {
            log.warn("Failed to send track like notification from {} for track {}: {}", likerId, trackId, e.getMessage());
        }
    }

    @Override
    public void sendPlaylistLikeNotification(Long likerId, Long playlistId) {
        try {
            User liker = userRepository.findById(likerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Liker not found"));
            Playlist playlist = playlistRepository.findById(playlistId)
                    .orElseThrow(() -> new ResourceNotFoundException("Playlist not found"));
            sendPlaylistLikeNotification(liker, playlist);
        } catch (Exception e) {
            log.warn("Failed to send playlist like notification from {} for playlist {}: {}", likerId, playlistId, e.getMessage());
        }
    }
} 