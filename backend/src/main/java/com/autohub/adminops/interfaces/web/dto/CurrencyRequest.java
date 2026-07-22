package com.autohub.adminops.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CurrencyRequest(
        @NotBlank @Size(min = 3, max = 3, message = "code must be exactly 3 characters") String code,
        @NotBlank @Size(max = 60) String name,
        Boolean active) {

    public boolean activeOrDefault() {
        return active == null || active;
    }
}
