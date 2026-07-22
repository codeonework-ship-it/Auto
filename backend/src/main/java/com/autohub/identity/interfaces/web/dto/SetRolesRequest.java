package com.autohub.identity.interfaces.web.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SetRolesRequest(@NotEmpty List<String> roleCodes) {
}
