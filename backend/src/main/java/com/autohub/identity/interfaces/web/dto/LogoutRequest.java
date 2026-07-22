package com.autohub.identity.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;

/** Body for logout: the refresh token to revoke. */
public record LogoutRequest(
        @NotBlank String refreshToken) {
}
