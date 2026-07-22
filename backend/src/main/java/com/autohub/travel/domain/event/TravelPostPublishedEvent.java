package com.autohub.travel.domain.event;

import com.autohub.shared.domain.DomainEvent;

import java.time.Instant;

/**
 * Emitted when a travel blog post is published. Topic: {@code travel.post.published}.
 * Consumed (async, via Outbox → Kafka) by feed/search indexers, notifications, etc.
 */
public record TravelPostPublishedEvent(String aggregateId, String slug,
                                       String authorId, Instant occurredAt) implements DomainEvent {

    public static final String TYPE = "travel.post.published";

    @Override
    public String eventType() { return TYPE; }

    @Override
    public String aggregateType() { return "TravelPost"; }
}
