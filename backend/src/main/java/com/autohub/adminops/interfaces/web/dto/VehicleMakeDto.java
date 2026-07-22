package com.autohub.adminops.interfaces.web.dto;

import com.autohub.adminops.infrastructure.persistence.VehicleMakeEntity;

public record VehicleMakeDto(String id, String name, String kind, boolean active) {

    public static VehicleMakeDto from(VehicleMakeEntity e) {
        return new VehicleMakeDto(e.getId().toString(), e.getName(), e.getKind(), e.isActive());
    }
}
