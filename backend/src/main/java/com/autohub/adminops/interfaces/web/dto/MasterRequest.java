package com.autohub.adminops.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MasterRequest(
        @NotBlank @Size(max = 120) String name,
        Boolean active) {

    public boolean activeOrDefault() {
        return active == null || active;
    }
}
