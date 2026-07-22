package com.autohub.identity.domain.event;

import com.autohub.shared.domain.DomainEvent;

import java.time.Instant;

/**
 * Emitted when a new user completes signup. Consumed (asynchronously, via the Outbox → Kafka
 * relay) by handlers that send a verification email, provision a profile, etc.
 * Topic: {@code identity.user.registered}.
 */
public record UserRegisteredEvent(String aggregateId, String email, String username, Instant occurredAt)
        implements DomainEvent {

    public static final String TYPE = "identity.user.registered";

    @Override
    public String eventType() { return TYPE; }

    @Override
    public String aggregateType() { return "User"; }
}
