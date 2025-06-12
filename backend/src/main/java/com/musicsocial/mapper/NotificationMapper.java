package com.musicsocial.mapper;

import com.musicsocial.domain.Notification;
import com.musicsocial.domain.User;
import com.musicsocial.dto.notification.NotificationDTO;
import com.musicsocial.dto.notification.NotificationCreateDTO;
import com.musicsocial.repository.UserRepository;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring", uses = {UserMapper.class}, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class NotificationMapper {
    
    @Autowired
    private UserRepository userRepository;
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sender", source = "senderId", qualifiedByName = "idToUser")
    @Mapping(target = "receiver", source = "receiverId", qualifiedByName = "idToUser")
    @Mapping(target = "read", constant = "false")
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "updatedAt", expression = "java(java.time.LocalDateTime.now())")
    public abstract Notification toEntity(NotificationCreateDTO dto);
    
    /**
     * Maps a Notification entity to a NotificationDTO
     * @param notification the notification entity
     * @return the notification DTO
     */
    @Mapping(target = "sender", source = "sender")
    @Mapping(target = "receiver", source = "receiver")
    public abstract NotificationDTO toDTO(Notification notification);
    
    @Named("idToUser")
    protected User idToUser(Long id) {
        if (id == null) {
            return null;
        }
        return userRepository.findById(id).orElse(null);
    }
} 