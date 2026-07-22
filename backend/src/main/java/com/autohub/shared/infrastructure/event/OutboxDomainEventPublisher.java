package com.autohub.shared.infrastructure.event;

import com.autohub.shared.application.port.DomainEventPublisher;
import com.autohub.shared.domain.DomainEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Outbox-backed implementation of {@link DomainEventPublisher}. Serialises the event and
 * appends an {@link OutboxEvent} row. Because callers invoke this inside their own
 * {@code @Transactional} use case, the outbox insert commits atomically with the aggregate
 * change. Actual delivery to Kafka is handled asynchronously by {@link OutboxRelay}.
 */
@Component
public class OutboxDomainEventPublisher implements DomainEventPublisher {

    private final OutboxEventRepository repository;
    private final ObjectMapper objectMapper;

    public OutboxDomainEventPublisher(OutboxEventRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @Override
    public void publish(DomainEvent event) {
        final String payload;
        try {
            payload = objectMapper.writeValueAsString(event);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialise domain event " + event.eventType(), e);
        }
        OutboxEvent row = new OutboxEvent(
                UUID.randomUUID(),
                event.aggregateType(),
                event.aggregateId(),
                event.eventType(),
                payload,
                event.occurredAt());
        repository.save(row);
    }
}
