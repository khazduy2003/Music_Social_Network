package com.musicsocial.mapper;

import com.musicsocial.domain.ListeningHistory;
import com.musicsocial.domain.User;
import com.musicsocial.dto.history.ListeningHistoryCreateDTO;
import com.musicsocial.dto.history.ListeningHistoryDTO;
import com.musicsocial.dto.history.ListeningHistoryUpdateDTO;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-06-14T18:27:53+0700",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.42.0.v20250514-1000, environment: Java 21.0.7 (Eclipse Adoptium)"
)
@Component
public class ListeningHistoryMapperImpl implements ListeningHistoryMapper {

    @Override
    public ListeningHistory toEntity(ListeningHistoryCreateDTO dto) {
        if ( dto == null ) {
            return null;
        }

        ListeningHistory listeningHistory = new ListeningHistory();

        listeningHistory.setDuration( dto.getDuration() );

        listeningHistory.setPlayedAt( java.time.LocalDateTime.now() );

        return listeningHistory;
    }

    @Override
    public ListeningHistoryDTO toDTO(ListeningHistory history) {
        if ( history == null ) {
            return null;
        }

        ListeningHistoryDTO listeningHistoryDTO = new ListeningHistoryDTO();

        listeningHistoryDTO.setUserId( historyUserId( history ) );
        listeningHistoryDTO.setUsername( historyUserUsername( history ) );
        listeningHistoryDTO.setCreatedAt( history.getCreatedAt() );
        listeningHistoryDTO.setDuration( history.getDuration() );
        listeningHistoryDTO.setId( history.getId() );
        listeningHistoryDTO.setPlayedAt( history.getPlayedAt() );
        listeningHistoryDTO.setUpdatedAt( history.getUpdatedAt() );

        listeningHistoryDTO.setTrack( mapTrack(history.getTrack()) );

        return listeningHistoryDTO;
    }

    @Override
    public void updateEntityFromDTO(ListeningHistoryUpdateDTO dto, ListeningHistory history) {
        if ( dto == null ) {
            return;
        }

        history.setDuration( dto.getDuration() );
    }

    private Long historyUserId(ListeningHistory listeningHistory) {
        if ( listeningHistory == null ) {
            return null;
        }
        User user = listeningHistory.getUser();
        if ( user == null ) {
            return null;
        }
        Long id = user.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String historyUserUsername(ListeningHistory listeningHistory) {
        if ( listeningHistory == null ) {
            return null;
        }
        User user = listeningHistory.getUser();
        if ( user == null ) {
            return null;
        }
        String username = user.getUsername();
        if ( username == null ) {
            return null;
        }
        return username;
    }
}
