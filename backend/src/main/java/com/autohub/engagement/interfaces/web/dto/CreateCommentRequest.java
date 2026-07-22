package com.autohub.engagement.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCommentRequest(
        @NotBlank @Size(max = 4000) String body,
        String parentId) {
}
