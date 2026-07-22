package com.autohub.adminops.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CityRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 120) String country,
        Boolean active) {

    public boolean activeOrDefault() {
        return active == null || active;
    }
}
