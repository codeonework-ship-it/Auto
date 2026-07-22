package com.autohub.media.domain.event;

import com.autohub.shared.domain.DomainEvent;

import java.time.Instant;

/** Emitted when an image is attached to a post. Topic: {@code media.image.uploaded}. */
public record ImageUploadedEvent(String aggregateId, String postId, String url,
                                 Instant occurredAt) implements DomainEvent {

    public static final String TYPE = "media.image.uploaded";

    @Override
    public String eventType() { return TYPE; }

    @Override
    public String aggregateType() { return "PostImage"; }
}
