package com.autohub.adminops.interfaces.web.dto;

import com.autohub.adminops.infrastructure.persistence.VehicleVariantEntity;

public record VehicleVariantDto(String id, String modelId, String name, boolean active) {

    public static VehicleVariantDto from(VehicleVariantEntity e) {
        return new VehicleVariantDto(e.getId().toString(), e.getModelId().toString(), e.getName(), e.isActive());
    }
}
