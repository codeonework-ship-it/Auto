package com.autohub.community.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;

/** Follow another user by their id. */
public record FollowRequest(@NotBlank String targetUserId) {
}
