package com.autohub.engagement.domain.event;

import com.autohub.shared.domain.DomainEvent;

import java.time.Instant;

/** Emitted when a review is added to a post. Topic: {@code engagement.review.added}. */
public record ReviewAddedEvent(String aggregateId, String postId, String authorId,
                               int rating, Instant occurredAt) implements DomainEvent {

    public static final String TYPE = "engagement.review.added";

    @Override
    public String eventType() { return TYPE; }

    @Override
    public String aggregateType() { return "Review"; }
}
