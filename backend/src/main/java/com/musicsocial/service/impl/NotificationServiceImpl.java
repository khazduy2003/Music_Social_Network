package com.musicsocial.service.impl;

import com.musicsocial.domain.Notification;
import com.musicsocial.domain.User;
import com.musicsocial.dto.notification.NotificationCreateDTO;
import com.musicsocial.dto.notification.NotificationDTO;
import com.musicsocial.dto.notification.ShareNotificationDTO;
import com.musicsocial.exception.ResourceNotFoundException;
import com.musicsocial.mapper.NotificationMapper;
import com.musicsocial.repository.NotificationRepository;
import com.musicsocial.repository.UserRepository;
import com.musicsocial.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

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
} 