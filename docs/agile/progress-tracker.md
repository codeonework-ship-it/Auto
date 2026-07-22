# AutoHub — Progress Tracker (living)

> This is a **living document**. Update the Status column as work moves. Source of truth for scope: [`CANONICAL_SPEC.md`](../../CANONICAL_SPEC.md). Cadence & scope per sprint: [`sprint-plan.md`](./sprint-plan.md).

_Last updated: 2026-07-22_

## Legend

| Status | Meaning |
| --- | --- |
| ✅ **Done** | Merged, meets [Definition of Done](./definition-of-done.md), accepted by PO |
| 🔵 **In-Progress** | Actively being worked in the current sprint |
| ⚪ **Todo** | Refined/estimated but not started |
| 🔴 **Blocked** | Cannot proceed — see Notes for the impediment |

---

## Story Board

| Sprint | Story ID | Description | Component | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| S0 | US-001 | Monorepo scaffold + conventions (`.gitignore`, `README`, `Makefile`) | Repo | ✅ Done | Layout per canonical spec |
| S0 | US-002 | Docker Compose (Postgres 16, Kafka KRaft, Adminer) | Infra | ✅ Done | Ports 5432 / 9092 / 8081 |
| S0 | US-003 | Postgres init + 4 env databases + Flyway baseline | DB | ✅ Done | Dev/QA/UAT/PROD DBs, owner `automobiles` |
| S0 | US-004 | Backend Clean-Architecture skeleton (bounded contexts) | Backend | ✅ Done | 8 contexts, 4 layers each |
| S0 | US-005 | Web-app scaffold (Vite + React 18 + Bootstrap 5) | Web-app | ✅ Done | Dev port 5173 |
| S0 | US-006 | Control-panel scaffold (Vite + React 18 + Bootstrap 5) | Control-panel | ✅ Done | Dev port 5174 |
| S0 | US-007 | Docs set (product / architecture / agile / design) | Docs | ✅ Done | This tracker included |
| S0 | US-008 | CI pipeline (lint + build + test) | CI | ✅ Done | Runs on every push |
| S1 | US-101 | User signup | identity | ✅ Done | Emits `identity.user.registered` via Outbox; verified end-to-end |
| S1 | US-102 | User login (JWT) + refresh | identity | 🔵 In-Progress | Login + JWT access/refresh issuance done & verified; `/auth/refresh` exchange endpoint pending |
| S1 | US-103 | Logout / session invalidation | identity | 🔵 In-Progress | Stateless JWT — client clears token; server-side refresh-token revocation pending |
| S1 | US-104 | Password policy & reset | identity | ⚪ Todo | BCrypt + min-length in place; reset flow pending |
| S1 | US-105 | Seed 8 fixed roles + permissions | identity / RBAC | ✅ Done | 8 roles, 21 permissions, mappings (Flyway V2 / local seeder) |
| S1 | US-106 | RBAC enforcement (route + method guards) | RBAC | ✅ Done | JWT authorities + `@PreAuthorize`; 403 denials verified |
| S1 | US-107 | User management (list, assign roles, status) | identity / control-panel | 🔵 In-Progress | Backend endpoints done & verified (roles/status lifecycle); control-panel UI wiring pending |
| S1 | US-108 | Masters CRUD | adminops / control-panel | 🔵 In-Progress | Generic CRUD for 7 name+active masters done & verified; currencies/cities/make hierarchy + roles/permissions pending |
| S2 | US-201 | Create car/bike post + rich text | catalog | ✅ Done | Jsoup-sanitized bodyHtml; publish emits `catalog.post.published`; verified |
| S2 | US-202 | Edit / delete post | catalog | ✅ Done | Owner/moderator-gated update & delete; verified (PUT 200, DELETE 204→404) |
| S2 | US-203 | Post list + detail + filters | catalog | 🔵 In-Progress | Public list + kind filter + detail-by-slug (drafts hidden) done; make/model attribute filters pending |
| S2 | US-204 | 20-image uploader | media | ✅ Done | multipart `files`, 20-cap enforced & verified |
| S2 | US-205 | Image validation (type/size/resolution) | media | ✅ Done | JPEG/PNG/WEBP, ≤5 MB, ≥640×480; 400s with clear messages verified |
| S2 | US-206 | Image gallery + web wiring | web-app / media | ✅ Done | Served via `/media/**`; feed cover + detail gallery render; emits `media.image.uploaded` |
| S3 | US-301 | Add review (rating + body) | engagement | 🔵 In-Progress | 1/user/post enforced (409); sanitized; emits `engagement.review.added`; review-tag linkage pending |
| S3 | US-302 | Comment on post (threaded) | engagement | ✅ Done | One-level threading (parentId); sanitized; verified |
| S3 | US-303 | Edit / delete comment & review | engagement | ✅ Done | Owner-gated edit; owner-or-moderator delete; verified |
| S3 | US-304 | Report content (report reasons) | moderation | ✅ Done | POST /reports (any member); subject POST/COMMENT/REVIEW/…; verified |
| S3 | US-305 | Moderator queue + hide/remove | moderation | ✅ Done | Queue + triage (report:review) + hide review/comment + delete (comment:moderate); verified. Control-panel UI pending |
| S4 | US-401 | Create marketplace listing | marketplace | ✅ Done | PENDING_REVIEW→ACTIVE; emits `marketplace.listing.created`; sanitized; verified |
| S4 | US-402 | Buyer offer on listing | marketplace | ✅ Done | `offer:create`; owner-only offer visibility (403 for others); verified |
| S4 | US-403 | Seller KYC submission | kyc | ✅ Done | `kyc:submit`; one-per-(user,type) 409; text-only docs; verified |
| S4 | US-404 | Buyer KYC submission | kyc | ✅ Done | Same flow, BUYER type; verified |
| S4 | US-405 | KYC review & approval | kyc | ✅ Done | `kyc:review` queue + approve/reject; verified. Control-panel UI pending |
| S4 | US-406 | Listing approval queue | marketplace | ✅ Done | `listing:approve` approve/reject; verified. Control-panel UI pending |
| S5 | US-501 | Publish travel blog post | travel | 🔵 In-Progress | Create/publish/detail + sanitized body verified; per-post image gallery pending |
| S5 | US-502 | Tour guide listing + categories | travel | ✅ Done | Tours CRUD (guide-owned); category master linkage optional; verified |
| S5 | US-503 | Create / join groups | community | ⚪ Todo | Not started |
| S5 | US-504 | Follow users / entities | community | ⚪ Todo | Not started |
| S5 | US-505 | Activity feed | community | ⚪ Todo | Not started |

---

## Sprint Completion Summary

| Sprint | Stories | Done | In-Progress | Todo | Blocked | % Complete |
| --- | --- | --- | --- | --- | --- | --- |
| S0 Foundation | 8 | 8 | 0 | 0 | 0 | **100%** |
| S1 Identity & RBAC | 8 | 3 | 4 | 1 | 0 | ~65% |
| S2 Catalog & Media | 6 | 5 | 1 | 0 | 0 | ~90% |
| S3 Engagement & Moderation | 5 | 4 | 1 | 0 | 0 | ~90% |
| S4 Marketplace & KYC | 6 | 6 | 0 | 0 | 0 | 100% (control-panel UI pending) |
| S5 Travel & Community | 5 | 1 | 1 | 3 | 0 | ~35% (Community not started) |
| **Overall** | **38** | **8** | **0** | **30** | **0** | **~21%** |

---

## Foundation Deliverables Completed (S0 checklist)

The following scaffold artifacts define the S0 increment (per the canonical repo layout). Check as delivered:

- [x] **Root scaffold** — `README.md`, `.gitignore`, `.env.example`, `Makefile`
- [x] **Docker Compose** — `docker-compose.yml` with Postgres 16, Kafka (KRaft, single broker), Adminer
- [x] **Database init** — `db/init/01-init-databases.sql` creating `AutomobilesDB_Dev` / `_QA` / `_UAT` / `_PROD`, owner role `automobiles`
- [x] **Flyway baseline** — migrations wired for the active Dev database
- [x] **Backend skeleton** — Spring Boot 3.3.x / Java 21, base package `com.autohub`, 8 bounded contexts (`identity`, `catalog`, `media`, `engagement`, `marketplace`, `travel`, `community`, `adminops`), each with `domain` / `application` / `infrastructure` / `interfaces` layers
- [x] **Event-driven plumbing** — `DomainEventPublisher` port + Outbox table + Kafka relay stubs
- [x] **Web-app scaffold** — Vite + React 18, react-router-dom v6, Bootstrap 5 + react-bootstrap, axios, react-hook-form, react-quill; dev port 5173 / container 80
- [x] **Control-panel scaffold** — Vite + React 18, Bootstrap 5, react-bootstrap; dev port 5174 / container 80
- [x] **Ports wired** — backend 8080, postgres 5432, kafka 9092, adminer 8081
- [x] **Docs** — `docs/product`, `docs/architecture`, `docs/agile` (this tracker, sprint plan, DoD), `docs/design` (design system, UX approach)
- [x] **CI** — lint + build + test pipeline runs green on push

> If any item above is not yet present in the working tree, flip it to unchecked and open a corresponding S0 story — the tracker must reflect reality.
