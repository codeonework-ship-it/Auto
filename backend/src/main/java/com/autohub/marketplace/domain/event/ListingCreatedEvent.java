package com.autohub.marketplace.domain.event;

import com.autohub.shared.domain.DomainEvent;

import java.time.Instant;

/**
 * Emitted when a marketplace listing is created (and enters review). Topic:
 * {@code marketplace.listing.created}. Consumed (async, via Outbox → Kafka) by
 * moderation queues, notifications, search indexers, etc.
 */
public record ListingCreatedEvent(String aggregateId, String title, String sellerId,
                                  Instant occurredAt) implements DomainEvent {

    public static final String TYPE = "marketplace.listing.created";

    @Override
    public String eventType() { return TYPE; }

    @Override
    public String aggregateType() { return "Listing"; }
}
