package com.autohub.identity.interfaces.web.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record SetPermissionsRequest(@NotNull List<String> permissionCodes) {
}
