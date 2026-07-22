package com.autohub.identity.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;

public record SetStatusRequest(@NotBlank String status) {
}
