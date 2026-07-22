package com.autohub.shared.infrastructure.event;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

/**
 * Transactional Outbox row. Written in the same DB transaction as the aggregate change;
 * a background relay ({@link OutboxRelay}) publishes PENDING rows to Kafka and marks them
 * PUBLISHED, giving at-least-once delivery without distributed transactions.
 */
@Entity
@Table(name = "outbox_events")
public class OutboxEvent {

    public enum Status { PENDING, PUBLISHED, FAILED }

    @Id
    private UUID id;

    @Column(name = "aggregate_type", nullable = false)
    private String aggregateType;

    @Column(name = "aggregate_id", nullable = false)
    private String aggregateId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", nullable = false)
    private String payload;

    @Column(name = "status", nullable = false)
    private String status = Status.PENDING.name();

    @Column(name = "attempts", nullable = false)
    private int attempts = 0;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt = Instant.now();

    @Column(name = "published_at")
    private Instant publishedAt;

    protected OutboxEvent() {
        // for JPA
    }

    public OutboxEvent(UUID id, String aggregateType, String aggregateId,
                       String eventType, String payload, Instant occurredAt) {
        this.id = id;
        this.aggregateType = aggregateType;
        this.aggregateId = aggregateId;
        this.eventType = eventType;
        this.payload = payload;
        this.occurredAt = occurredAt;
        this.status = Status.PENDING.name();
    }

    public void markPublished() {
        this.status = Status.PUBLISHED.name();
        this.publishedAt = Instant.now();
    }

    public void markFailed() {
        this.attempts += 1;
        this.status = Status.FAILED.name();
    }

    public UUID getId() { return id; }
    public String getAggregateType() { return aggregateType; }
    public String getAggregateId() { return aggregateId; }
    public String getEventType() { return eventType; }
    public String getPayload() { return payload; }
    public String getStatus() { return status; }
    public int getAttempts() { return attempts; }
    public Instant getOccurredAt() { return occurredAt; }
    public Instant getPublishedAt() { return publishedAt; }
}
