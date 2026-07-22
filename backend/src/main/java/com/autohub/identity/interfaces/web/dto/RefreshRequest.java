package com.autohub.identity.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;

/** Body for the rotating refresh endpoint. */
public record RefreshRequest(
        @NotBlank String refreshToken) {
}
