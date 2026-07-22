package com.autohub.notifications.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Admin/system request to create a notification for a recipient. Entity refs are optional. */
public record CreateNotificationRequest(
        @NotNull String recipientId,
        @NotBlank @Size(max = 80) String type,
        @NotBlank @Size(max = 200) String title,
        String body,
        String entityType,
        String entityId) {
}
