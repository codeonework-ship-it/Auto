# ADR-0004: Monorepo

- **Status:** Accepted
- **Date:** 2026-07-22
- **Deciders:** Software Architecture

## Context

AutoHub comprises a Spring Boot backend, two React applications (`web-app` and `control-panel`),
database initialization and migrations, container orchestration, and extensive documentation
(product, architecture, agile, design). These parts share contracts (API shapes, RBAC permissions,
image rules) and must evolve together. We need a repository strategy that keeps them consistent and
easy to build locally.

## Decision

Use a **single Git monorepo** rooted at `E:\Anand\Projects\Automobiles` containing all components:

```
/backend/            Spring Boot backend
/web-app/            React public/community app
/control-panel/      React admin app
/db/init/            database initialization SQL
/docker-compose.yml  local orchestration
/Makefile            common tasks
/docs/               product, architecture, agile, design
```

All components, infrastructure definitions, and documentation live and version together.

## Consequences

**Positive**

- **Atomic cross-cutting changes:** an API change and its front-end consumers (and docs) can land
  in one commit/PR, keeping contracts consistent.
- Single clone, single `docker-compose up` brings up the whole stack; low onboarding friction.
- Shared documentation and decisions live alongside the code they describe.
- One source of truth for versioning and CI configuration.

**Negative / trade-offs**

- The repository is larger and CI must be path-aware to avoid rebuilding everything on every change
  (mitigated with per-component pipelines / affected-only builds).
- Independent deployment cadence per component requires discipline (tags/paths) rather than being
  enforced by separate repos.
- Access control is coarser than with multiple repos (acceptable for a single team).

## Alternatives Considered

- **Polyrepo (separate repos for backend, web-app, control-panel, infra, docs):** stronger
  isolation and independent CI, but cross-cutting contract changes span multiple PRs and drift
  easily; higher coordination cost for a small team. Rejected for now.
- **Two repos (backend + combined frontend):** partial improvement but still splits the API
  contract from its consumers. Rejected in favor of a single repo.
