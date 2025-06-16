package com.musicsocial.mapper;

import com.musicsocial.domain.Notification;
import com.musicsocial.dto.notification.NotificationCreateDTO;
import com.musicsocial.dto.notification.NotificationDTO;
import javax.annotation.processing.Generated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-06-16T17:18:22+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.15 (Oracle Corporation)"
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
        notification.message( dto.getMessage() );
        notification.type( dto.getType() );
        notification.itemType( dto.getItemType() );
        notification.itemId( dto.getItemId() );

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
        notificationDTO.id( notification.getId() );
        notificationDTO.message( notification.getMessage() );
        notificationDTO.type( notification.getType() );
        notificationDTO.itemType( notification.getItemType() );
        notificationDTO.itemId( notification.getItemId() );
        notificationDTO.read( notification.isRead() );
        notificationDTO.createdAt( notification.getCreatedAt() );
        notificationDTO.updatedAt( notification.getUpdatedAt() );

        return notificationDTO.build();
    }
}
