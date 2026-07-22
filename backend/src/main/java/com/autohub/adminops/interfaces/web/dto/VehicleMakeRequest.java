package com.autohub.adminops.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record VehicleMakeRequest(
        @NotBlank @Size(max = 80) String name,
        @NotBlank @Pattern(regexp = "CAR|BIKE|BOTH", message = "kind must be CAR, BIKE or BOTH") String kind,
        Boolean active) {

    public boolean activeOrDefault() {
        return active == null || active;
    }
}
