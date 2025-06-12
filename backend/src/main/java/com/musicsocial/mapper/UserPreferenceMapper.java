package com.musicsocial.mapper;

import com.musicsocial.domain.UserPreference;
import com.musicsocial.dto.preference.UserPreferenceDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserPreferenceMapper {
    @Mapping(target = "userId", source = "user.id")
    UserPreferenceDTO toDTO(UserPreference userPreference);

    @Mapping(target = "user", ignore = true)
    UserPreference toEntity(UserPreferenceDTO dto);
} 