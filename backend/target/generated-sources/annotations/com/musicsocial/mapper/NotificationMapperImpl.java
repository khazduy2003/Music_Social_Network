package com.musicsocial.mapper;

import com.musicsocial.domain.Notification;
import com.musicsocial.dto.notification.NotificationCreateDTO;
import com.musicsocial.dto.notification.NotificationDTO;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-06-12T18:13:17+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.42.0.v20250514-1000, environment: Java 21.0.7 (Eclipse Adoptium)"
)
@Component
public class NotificationMapperImpl extends NotificationMapper {

    @Autowired
    private UserMapper userMapper;

    @Override
    public Notification toEntity(NotificationCreateDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Notification.NotificationBuilder notification = Notification.builder();

        notification.sender( idToUser( dto.getSenderId() ) );
        notification.receiver( idToUser( dto.getReceiverId() ) );
        notification.itemId( dto.getItemId() );
        notification.itemType( dto.getItemType() );
        notification.message( dto.getMessage() );
        notification.type( dto.getType() );

        notification.read( false );
        notification.createdAt( java.time.LocalDateTime.now() );
        notification.updatedAt( java.time.LocalDateTime.now() );

        return notification.build();
    }

    @Override
    public NotificationDTO toDTO(Notification notification) {
        if ( notification == null ) {
            return null;
        }

        NotificationDTO.NotificationDTOBuilder notificationDTO = NotificationDTO.builder();

        notificationDTO.sender( userMapper.toDTO( notification.getSender() ) );
        notificationDTO.receiver( userMapper.toDTO( notification.getReceiver() ) );
        notificationDTO.createdAt( notification.getCreatedAt() );
        notificationDTO.id( notification.getId() );
        notificationDTO.itemId( notification.getItemId() );
        notificationDTO.itemType( notification.getItemType() );
        notificationDTO.message( notification.getMessage() );
        notificationDTO.read( notification.isRead() );
        notificationDTO.type( notification.getType() );
        notificationDTO.updatedAt( notification.getUpdatedAt() );

        return notificationDTO.build();
    }
}
