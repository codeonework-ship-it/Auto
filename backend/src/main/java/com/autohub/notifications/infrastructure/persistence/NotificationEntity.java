package com.autohub.notifications.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/** Persistence model for a user notification (table {@code notifications}). */
@Entity
@Table(name = "notifications")
public class NotificationEntity {

    @Id
    private UUID id;

    @Column(name = "recipient_id", nullable = false)
    private UUID recipientId;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String title;

    @Column
    private String body;

    @Column(name = "entity_type")
    private String entityType;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected NotificationEntity() { }

    public NotificationEntity(UUID id, UUID recipientId, String type, String title, String body,
                             String entityType, UUID entityId) {
        this.id = id;
        this.recipientId = recipientId;
        this.type = type;
        this.title = title;
        this.body = body;
        this.entityType = entityType;
        this.entityId = entityId;
        this.read = false;
        this.createdAt = Instant.now();
    }

    public void markRead() { this.read = true; }

    public UUID getId() { return id; }
    public UUID getRecipientId() { return recipientId; }
    public String getType() { return type; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public String getEntityType() { return entityType; }
    public UUID getEntityId() { return entityId; }
    public boolean isRead() { return read; }
    public Instant getCreatedAt() { return createdAt; }
}
