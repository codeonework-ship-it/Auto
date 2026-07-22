package com.autohub.adminops.interfaces.web.dto;

import com.autohub.adminops.infrastructure.persistence.NamedMasterEntity;

public record MasterDto(String id, String name, boolean active) {

    public static MasterDto from(NamedMasterEntity e) {
        return new MasterDto(e.getId().toString(), e.getName(), e.isActive());
    }
}
