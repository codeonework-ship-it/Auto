package com.autohub.catalog.domain.event;

import com.autohub.shared.domain.DomainEvent;

import java.time.Instant;

/**
 * Emitted when a car/bike post is published. Topic: {@code catalog.post.published}.
 * Consumed (async, via Outbox → Kafka) by feed/search indexers, notifications, etc.
 */
public record PostPublishedEvent(String aggregateId, String kind, String slug,
                                 String authorId, Instant occurredAt) implements DomainEvent {

    public static final String TYPE = "catalog.post.published";

    @Override
    public String eventType() { return TYPE; }

    @Override
    public String aggregateType() { return "Post"; }
}
