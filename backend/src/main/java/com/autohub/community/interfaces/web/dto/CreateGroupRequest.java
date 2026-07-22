package com.autohub.community.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Create a community group. {@code description} is sanitized server-side; slug is derived from name. */
public record CreateGroupRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 500) String description) {
}
