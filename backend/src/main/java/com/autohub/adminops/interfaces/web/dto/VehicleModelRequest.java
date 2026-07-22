package com.autohub.adminops.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record VehicleModelRequest(
        @NotNull UUID makeId,
        @NotBlank @Size(max = 120) String name,
        Boolean active) {

    public boolean activeOrDefault() {
        return active == null || active;
    }
}
