package com.autohub.adminops.interfaces.web.dto;

import com.autohub.adminops.infrastructure.persistence.VehicleModelEntity;

public record VehicleModelDto(String id, String makeId, String name, boolean active) {

    public static VehicleModelDto from(VehicleModelEntity e) {
        return new VehicleModelDto(e.getId().toString(), e.getMakeId().toString(), e.getName(), e.isActive());
    }
}
