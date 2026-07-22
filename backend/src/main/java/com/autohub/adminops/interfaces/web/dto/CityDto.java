package com.autohub.adminops.interfaces.web.dto;

import com.autohub.adminops.infrastructure.persistence.CityEntity;

public record CityDto(String id, String name, String country, boolean active) {

    public static CityDto from(CityEntity e) {
        return new CityDto(e.getId().toString(), e.getName(), e.getCountry(), e.isActive());
    }
}
