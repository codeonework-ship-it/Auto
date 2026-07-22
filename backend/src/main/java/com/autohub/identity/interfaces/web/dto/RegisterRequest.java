package com.autohub.identity.interfaces.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Signup payload. A registered account is required before commenting/reviewing. */
public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 3, max = 60) String username,
        @NotBlank @Size(min = 8, max = 100) String password,
        @Size(max = 120) String displayName) {
}
