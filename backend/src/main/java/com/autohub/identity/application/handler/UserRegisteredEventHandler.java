package com.autohub.identity.application.handler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Example asynchronous consumer of the {@code identity.user.registered} event (delivered via
 * the Outbox → Kafka relay). In production this would trigger a welcome/verification email,
 * profile provisioning, etc. Consumers MUST be idempotent since delivery is at-least-once.
 *
 * <p>SCAFFOLD: logs the event. Only active when a Kafka broker is reachable.
 */
@Component
public class UserRegisteredEventHandler {

    private static final Logger log = LoggerFactory.getLogger(UserRegisteredEventHandler.class);

    @KafkaListener(topics = "identity.user.registered", groupId = "identity-welcome")
    public void onUserRegistered(String payload) {
        // Idempotency key would be the event's aggregateId / a dedicated eventId claim.
        log.info("[event] identity.user.registered received -> would send welcome email. payload={}", payload);
    }
}
