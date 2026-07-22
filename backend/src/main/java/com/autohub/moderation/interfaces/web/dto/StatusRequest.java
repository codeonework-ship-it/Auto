package com.autohub.moderation.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;

/** Generic status-change payload for moderation actions (report + content status). */
public record StatusRequest(@NotBlank String status) {
}
