# ADR-0002: Clean Architecture with Bounded Contexts

- **Status:** Accepted
- **Date:** 2026-07-22
- **Deciders:** Software Architecture

## Context

AutoHub spans several distinct domains — identity/RBAC/KYC, catalog, media, engagement,
marketplace, travel, community, and admin operations. These areas have different rules and evolve
at different speeds. A conventional layered "controllers → services → repositories" structure
tends to leak persistence and framework concerns into business logic, making the domain hard to
test and change. We want business rules isolated from frameworks (Spring, JPA, Kafka, web) and a
structure that scales as contexts grow.

## Decision

Adopt **Clean Architecture (Ports & Adapters)**, organized **by bounded context first, then by
layer**. Base package `com.autohub` with contexts: `identity`, `catalog`, `media`, `engagement`,
`marketplace`, `travel`, `community`, `adminops`.

Each context has four layers with a strict inward dependency rule:

- `domain` — entities, value objects, domain events, repository **port** interfaces. No framework
  imports; depends on nothing.
- `application` — use cases, command/query handlers, port interfaces, event handlers.
- `infrastructure` — JPA adapters (implement ports), Kafka, security, config.
- `interfaces` — REST controllers, DTOs, mappers (web adapter).

Dependency rule: `interfaces → application → domain`; `infrastructure → application/domain`;
`domain` depends on nothing. Outbound dependencies are expressed as **ports** owned by inner layers
and implemented by **adapters** in `infrastructure`.

## Consequences

**Positive**

- The domain and application layers are pure and unit-testable without Spring or a database.
- Infrastructure choices (PostgreSQL, Kafka, object store) are swappable behind ports.
- Bounded contexts keep the codebase modular and enable independent evolution and clear ownership.
- The repeated four-layer structure is predictable and can be enforced automatically (e.g.
  ArchUnit tests asserting the dependency rule).

**Negative / trade-offs**

- More indirection and boilerplate (ports, adapters, mappers, DTOs) than a flat CRUD app.
- Requires team discipline to avoid "leaking" JPA entities or Spring types into inner layers.
- Slight upfront cost that pays off as domains grow in complexity.

## Alternatives Considered

- **Traditional N-tier (anemic services + JPA everywhere):** simplest short-term, but couples
  business rules to the ORM and web framework; rejected for a domain-heavy product.
- **Full microservices per context:** maximum isolation, but excessive operational overhead for
  the current team/scale. We keep contexts as modules in one deployable (see ADR-0004) and can
  extract services later precisely because contexts are already isolated.
- **Vertical slice architecture only:** good for feature cohesion, but we still want the explicit
  domain/application/infrastructure/interfaces separation for testability; Clean Architecture is
  applied within each context.
