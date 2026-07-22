package com.autohub.identity.interfaces.web.dto;

import com.autohub.identity.infrastructure.persistence.PermissionEntity;
import com.autohub.identity.infrastructure.persistence.RoleEntity;

import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

public record RoleView(String id, String code, String name, String description, Set<String> permissions) {

    public static RoleView from(RoleEntity e) {
        Set<String> perms = e.getPermissions().stream()
                .map(PermissionEntity::getCode)
                .collect(Collectors.toCollection(TreeSet::new));
        return new RoleView(e.getId().toString(), e.getCode(), e.getName(), e.getDescription(), perms);
    }
}
