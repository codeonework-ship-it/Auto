package com.autohub.identity.interfaces.web.dto;

import com.autohub.identity.infrastructure.persistence.PermissionEntity;

public record PermissionView(String id, String code, String description) {

    public static PermissionView from(PermissionEntity e) {
        return new PermissionView(e.getId().toString(), e.getCode(), e.getDescription());
    }
}
