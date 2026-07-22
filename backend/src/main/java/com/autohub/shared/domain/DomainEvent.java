package com.autohub.shared.domain;

import java.time.Instant;

/**
 * Marker contract for all domain events. Implementations are immutable facts about
 * something that has happened in the domain (past tense), published via the
 * {@link com.autohub.shared.application.port.DomainEventPublisher} port and persisted
 * to the Outbox in the same transaction as the state change.
 */
public interface DomainEvent {

    /** Logical event type, e.g. {@code identity.user.registered}. Used as the Kafka topic. */
    String eventType();

    /** Type of the aggregate that emitted the event, e.g. {@code User}. */
    String aggregateType();

    /** Identifier of the aggregate instance. */
    String aggregateId();

    /** When the event occurred. */
    Instant occurredAt();
}
