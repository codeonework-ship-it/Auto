# ADR-0005: PostgreSQL with Flyway Migrations

- **Status:** Accepted
- **Date:** 2026-07-22
- **Deciders:** Software Architecture

## Context

AutoHub's data is highly relational (users, roles/permissions, vehicle taxonomy, posts, images,
reviews, comments, listings, offers, travel/tours, communities, masters, outbox, audit, reports)
with strong integrity requirements. It also needs a JSON-capable column for the Outbox event
envelope. The schema is shared across four environments (`AutomobilesDB_Dev`, `_QA`, `_UAT`,
`_PROD`) and must evolve safely and repeatably as the product grows across six sprints.

## Decision

Use **PostgreSQL 16** as the system of record, with **Flyway** for versioned, forward-only schema
migrations.

- One PostgreSQL instance hosts the four environment databases, owned by role `automobiles`.
- Schema changes are expressed as versioned Flyway SQL migrations (`V<n>__description.sql`) checked
  into the monorepo and applied automatically at backend startup / in CI.
- The same migration set is applied to every environment, guaranteeing schema parity.
- JSONB is used for flexible payloads (e.g. `outbox_events.payload`, `audit_log.details`); strong
  referential integrity (foreign keys, unique constraints) enforces the relational rules described
  in the ERD.

## Consequences

**Positive**

- Reliable transactions and referential integrity underpin the transactional Outbox and RBAC
  joins.
- JSONB gives schema flexibility exactly where needed without abandoning relational guarantees.
- Flyway makes schema changes versioned, reviewable, and reproducible; environments stay in sync.
- Migrations live with the code that depends on them (monorepo), enabling atomic schema+code
  changes.

**Negative / trade-offs**

- Forward-only migrations require care: destructive changes need expand/contract (multi-step)
  patterns rather than in-place edits.
- Migration history must never be rewritten once applied to a shared environment.
- A single database engine choice; cross-engine portability is not a goal (accepted).

## Alternatives Considered

- **Hibernate `ddl-auto` schema generation:** convenient in dev but unsafe and non-deterministic
  for shared/production environments; rejected in favor of explicit, reviewed migrations.
- **Liquibase instead of Flyway:** capable equivalent with XML/YAML changesets; Flyway's plain-SQL,
  convention-based approach was preferred for simplicity and transparency.
- **MySQL / MariaDB:** viable relational option, but PostgreSQL's JSONB and transactional feature
  set better fit the Outbox and flexible payloads (see ADR-0001).
- **A NoSQL store:** rejected — the domain is strongly relational and integrity-critical.
