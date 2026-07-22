package com.autohub.notifications.interfaces.web.dto;

import com.autohub.notifications.infrastructure.persistence.NotificationEntity;

import java.time.Instant;

public record NotificationResponse(String id, String recipientId, String type, String title,
                                   String body, String entityType, String entityId, boolean read,
                                   Instant createdAt) {

    public static NotificationResponse from(NotificationEntity e) {
        return new NotificationResponse(
                e.getId().toString(), e.getRecipientId().toString(), e.getType(), e.getTitle(),
                e.getBody(), e.getEntityType(),
                e.getEntityId() == null ? null : e.getEntityId().toString(),
                e.isRead(), e.getCreatedAt());
    }
}
