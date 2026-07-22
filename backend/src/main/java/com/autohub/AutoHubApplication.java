package com.autohub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * AutoHub backend entry point.
 *
 * <p>Architecture: Clean Architecture (domain / application / infrastructure / interfaces)
 * organised by bounded context, with an event-driven core built on the transactional
 * Outbox pattern and Kafka. See {@code docs/architecture/}.
 */
@SpringBootApplication
@EnableScheduling
public class AutoHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(AutoHubApplication.class, args);
    }
}
