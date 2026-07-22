package com.autohub.shared.application.port;

import com.autohub.shared.domain.DomainEvent;

/**
 * Outbound port for publishing domain events. Application services depend only on this
 * abstraction; the infrastructure layer provides an Outbox-backed adapter so events are
 * persisted atomically with the aggregate change and relayed to Kafka asynchronously.
 */
public interface DomainEventPublisher {

    void publish(DomainEvent event);
}
