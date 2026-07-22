# ADR-0001: Technology Stack

- **Status:** Accepted
- **Date:** 2026-07-22
- **Deciders:** Software Architecture

## Context

AutoHub is a community platform combining car/bike posts, reviews & comments, a travel blog with
tour guide, community groups, and a KYC-gated marketplace, plus an administrative control-panel.
It needs a mature backend capable of expressing rich domain rules, reliable persistence, and
asynchronous cross-context communication, with two React front-ends (public and admin). The stack
must be productive for a small team, well-supported long-term, and container-friendly for
Dev/QA/UAT/PROD parity.

## Decision

Adopt the following fixed stack:

- **Backend:** Java 21 (LTS), Spring Boot 3.3.x, built with Maven. Clean Architecture with an
  event-driven core (Spring domain events + transactional Outbox + Kafka).
- **Database:** PostgreSQL 16 with Flyway migrations.
- **Messaging:** Apache Kafka in KRaft mode (single broker) for domain-event distribution.
- **Frontend:** Vite + React 18, react-router-dom v6, Bootstrap 5 + react-bootstrap, axios,
  react-hook-form, react-quill for rich text, and a 20-image uploader. Two apps: `web-app`
  (public/community) and `control-panel` (admin).
- **Infrastructure:** Docker + Docker Compose; Adminer for local DB inspection.
- **Ports:** backend 8080, web-app 5173/80, control-panel 5174/80, PostgreSQL 5432, Kafka 9092,
  Adminer 8081.

## Consequences

**Positive**

- Java 21 + Spring Boot 3.3.x is a mature, well-documented, LTS-aligned platform with first-class
  support for JPA, security, and Kafka.
- PostgreSQL 16 provides strong relational integrity, JSONB (used for the Outbox envelope), and
  reliable transactions — a good fit for the transactional Outbox.
- Kafka gives durable, ordered, replayable event streaming for eventual consistency across bounded
  contexts.
- Vite + React 18 + Bootstrap yields fast, consistent front-end development for both apps.
- Docker Compose gives reproducible local environments and parity with higher environments.

**Negative / trade-offs**

- Running Kafka (even single-broker KRaft) adds operational weight versus a simpler in-process
  event bus.
- Two React apps mean some duplicated build/config, mitigated by the monorepo (see ADR-0004).
- Java verbosity vs. lighter runtimes; accepted for the ecosystem maturity and type safety.

## Alternatives Considered

- **Node.js/NestJS backend:** attractive single-language stack, but the team prefers Java's
  maturity for a domain-heavy, transactional system.
- **RabbitMQ instead of Kafka:** simpler to operate, but Kafka's log retention and replay better
  fit event-sourced/eventually-consistent read models.
- **MySQL instead of PostgreSQL:** viable, but PostgreSQL's JSONB and transactional features suit
  the Outbox and flexible payloads better.
- **Next.js (SSR) front-end:** unnecessary for an authenticated SPA-style product; Vite SPA keeps
  the front-end simple and cache-friendly.
