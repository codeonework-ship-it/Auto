# AutoHub — Definition of Done (DoD)

> The DoD is a shared quality contract. Nothing is "done" until it satisfies the relevant checklist. Three levels: **Story**, **Sprint**, **Release**. Related: [Sprint Plan](./sprint-plan.md) · [Progress Tracker](./progress-tracker.md) · canonical [`CANONICAL_SPEC.md`](../../CANONICAL_SPEC.md).

---

## Definition of Ready (entry gate, for context)

A story may be pulled into a sprint only when it has: an `As a / I want / so that` statement, Acceptance Criteria in Given/When/Then form, linked test cases (`TC-xxx`), listed edge cases, an estimate, and no blocking dependency.

---

## 1. Story-level DoD

A user story is Done when **all** of the following are true.

### Code & Design
- [ ] All Acceptance Criteria (Given/When/Then) demonstrably met
- [ ] Code follows Clean Architecture layering (interfaces → application → domain; infrastructure → application/domain; domain depends on nothing)
- [ ] No new checkstyle / ESLint / Prettier violations
- [ ] Feature flagged or safely toggleable where risky
- [ ] No secrets, credentials, or tokens committed (dev DB password only per canonical-spec exception)

### Review
- [ ] Peer code review approved (≥1 reviewer; ≥2 for security-sensitive or auth/KYC code)
- [ ] PR description links the story ID and test cases

### Tests
- [ ] Unit tests for domain + application logic (meaningful assertions, not coverage padding)
- [ ] Integration tests for adapters (JPA, REST, Kafka) where applicable
- [ ] E2E/UI test for the primary happy path of user-facing stories
- [ ] Edge cases from the story exercised by tests
- [ ] Coverage does not regress below the agreed threshold (target ≥80% on changed code)

### Docs
- [ ] API contract updated (`docs/architecture/api-contracts`) for new/changed endpoints
- [ ] Relevant ADR added/updated for significant decisions (`docs/architecture/adr`)
- [ ] User-facing behavior reflected in product docs where needed
- [ ] Progress Tracker status updated

### Accessibility (a11y)
- [ ] Meets WCAG 2.1 **AA**: text contrast ≥4.5:1 (≥3:1 large text/UI)
- [ ] Fully keyboard-operable; visible focus states; logical tab order
- [ ] Semantic HTML / ARIA labels; forms have associated labels & error messaging
- [ ] Images have alt text; interactive components announce state to screen readers

### Security
- [ ] Input validated & output encoded (XSS-safe; react-quill content sanitized)
- [ ] RBAC enforced server-side (`resource:action`), not just hidden in UI
- [ ] Authn/authz checks on every protected endpoint
- [ ] No sensitive data in URLs, logs, or query strings
- [ ] Dependency scan shows no new high/critical vulnerabilities

### CI/CD
- [ ] Branch builds green (lint + unit + integration + e2e)
- [ ] Merged to trunk with no failing pipeline
- [ ] Database changes are Flyway migrations (forward-only, reviewed)

---

## 2. Sprint-level DoD

The sprint increment is Done when:

- [ ] Every committed story meets the **Story-level DoD** (or is explicitly de-scoped and returned to backlog)
- [ ] Increment is **potentially shippable** and deployed to the Dev (and where applicable QA) environment
- [ ] Sprint Goal demonstrably achieved and shown at Sprint Review
- [ ] Full regression suite green on the integration branch
- [ ] No open **critical/blocker** defects; known lesser defects logged & triaged
- [ ] Domain events for the sprint's features published & consumed end-to-end (Outbox → Kafka → handler)
- [ ] `docker compose up` yields a healthy full stack; smoke tests pass
- [ ] Documentation (API, ADRs, product, tracker) synchronized with the increment
- [ ] Retrospective held; improvement actions recorded and assigned

---

## 3. Release-level DoD

A release (see [Release Plan](./sprint-plan.md#4-release-plan)) is Done when:

- [ ] All in-scope sprint increments accepted by the Product Owner
- [ ] Full regression + non-functional tests pass (performance, load on feed/gallery, resilience)
- [ ] **Security review** completed (OWASP Top 10 pass, auth/RBAC/KYC audited, pen-test findings resolved for GA)
- [ ] Accessibility audit at WCAG **AA** across both apps
- [ ] Data migrations validated on a production-like dataset; rollback plan documented
- [ ] **Production secrets** sourced from a secrets manager — no committed credentials in the prod path
- [ ] Environment promotion verified: `AutomobilesDB_Dev` → `_QA` → `_UAT` → `_PROD`
- [ ] Observability in place: health checks, metrics, structured logs, alerts
- [ ] Runbook / rollback / on-call docs updated
- [ ] Release notes & changelog published; version tagged
- [ ] Stakeholder sign-off (Product Owner + Security + Ops)

---

## Quick Reference

| Gate | Owner | Must be green before |
| --- | --- | --- |
| Story DoD | Dev + Reviewer | Story marked Done |
| Sprint DoD | Scrum Master + PO | Sprint Review acceptance |
| Release DoD | PO + Security + Ops | Promotion to next environment / GA |
