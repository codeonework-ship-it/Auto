package com.autohub.identity.interfaces.web.dto;

import com.autohub.identity.domain.model.User;

import java.util.Set;

public record UserResponse(String id, String email, String username, String displayName,
                           String status, Set<String> roles, Set<String> permissions) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId().toString(), user.getEmail(), user.getUsername(), user.getDisplayName(),
                user.getStatus().name(), user.getRoleCodes(), user.getPermissionCodes());
    }
}
