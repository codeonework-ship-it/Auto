# ADR-0003: Event-Driven Architecture with Transactional Outbox

- **Status:** Accepted
- **Date:** 2026-07-22
- **Deciders:** Software Architecture

## Context

AutoHub's bounded contexts must react to each other's changes — e.g. publishing a post updates
community feeds and engagement counters; approving KYC enables a seller in the marketplace. Direct
synchronous calls between contexts create tight coupling and cascading failures. We also need
reliable propagation: a domain change and its notification must not diverge. Publishing to Kafka
and committing to PostgreSQL are separate systems, so a naive "save then publish" risks a
dual-write inconsistency if either step fails.

## Decision

Adopt **event-driven communication** between contexts using **domain events** distributed over
**Apache Kafka**, produced reliably with the **transactional Outbox pattern**:

- Aggregates raise domain events; the application layer hands them to a `DomainEventPublisher`
  port.
- The event is written to an `outbox_events` table **in the same local transaction** as the
  business change (atomic; no dual write).
- An **Outbox relay** polls `outbox_events`, publishes each envelope to the Kafka topic named by
  its `type` (keyed by `aggregateId` for per-aggregate ordering), and marks it published.
- Delivery is **at-least-once**; consumers are **idempotent** (de-duplicate on `eventId`).
- Standard topics: `identity.user.registered`, `catalog.post.published`,
  `marketplace.listing.created`, `engagement.review.added`, `media.image.uploaded`.
- Envelope fields: `eventId`, `type`, `aggregateId`, `occurredAt`, `payload`, `version`.

## Consequences

**Positive**

- No dual-write inconsistency: the business change and the event commit atomically.
- Contexts are loosely coupled and can evolve/scale independently; new consumers can be added
  without touching producers.
- Kafka provides durability, ordering (per partition key), and replay for rebuilding read models.
- The pattern degrades gracefully: if Kafka is briefly unavailable, events accumulate in the
  Outbox and are relayed when it recovers.

**Negative / trade-offs**

- **Eventual consistency:** cross-context read models lag the producing transaction; UIs must
  tolerate this.
- At-least-once delivery forces every consumer to be idempotent (processed-events tracking).
- Operational components to run and monitor: the relay and Kafka itself.
- Extra table and polling overhead versus fire-and-forget in-process events.

## Alternatives Considered

- **Direct synchronous REST/in-process calls between contexts:** simple but tightly coupled and
  fragile under partial failure; rejected.
- **Publish to Kafka directly inside the business transaction (no Outbox):** reintroduces the
  dual-write problem; rejected.
- **Change Data Capture (e.g. Debezium reading the WAL):** removes the polling relay but adds
  significant infrastructure and coupling to the DB log; the explicit Outbox table is simpler for
  the current scale and keeps envelopes application-defined. Can be revisited later.
- **In-process Spring events only (no broker):** insufficient for durability, replay, and future
  service extraction.
