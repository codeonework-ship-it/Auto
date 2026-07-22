package com.autohub.shared.infrastructure.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Background relay that drains PENDING {@link OutboxEvent} rows and publishes them to Kafka
 * (topic = event type). Provides at-least-once delivery; downstream consumers must be
 * idempotent. When {@code autohub.events.kafka-enabled=false} the relay simply marks rows
 * published (useful for tests / local runs without a broker).
 */
@Component
public class OutboxRelay {

    private static final Logger log = LoggerFactory.getLogger(OutboxRelay.class);
    private static final int BATCH_SIZE = 100;

    private final OutboxEventRepository repository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final boolean kafkaEnabled;

    public OutboxRelay(OutboxEventRepository repository,
                       KafkaTemplate<String, String> kafkaTemplate,
                       @Value("${autohub.events.kafka-enabled:true}") boolean kafkaEnabled) {
        this.repository = repository;
        this.kafkaTemplate = kafkaTemplate;
        this.kafkaEnabled = kafkaEnabled;
    }

    @Scheduled(fixedDelayString = "${autohub.events.outbox-relay-fixed-delay-ms:5000}")
    @Transactional
    public void relay() {
        List<OutboxEvent> pending = repository.findByStatusOrderByOccurredAtAsc(
                OutboxEvent.Status.PENDING.name(), PageRequest.of(0, BATCH_SIZE));
        if (pending.isEmpty()) {
            return;
        }
        for (OutboxEvent event : pending) {
            try {
                if (kafkaEnabled) {
                    kafkaTemplate.send(event.getEventType(), event.getAggregateId(), event.getPayload());
                }
                event.markPublished();
            } catch (Exception ex) {
                log.warn("Failed to publish outbox event {} ({}): {}",
                        event.getId(), event.getEventType(), ex.getMessage());
                event.markFailed();
            }
        }
        repository.saveAll(pending);
        log.debug("Outbox relay published {} event(s)", pending.size());
    }
}
