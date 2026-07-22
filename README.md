# 🚗 AutoHub

A community platform for **cars, bikes and travel** — post & read vehicle reviews, upload image
galleries, buy & sell in a KYC-gated marketplace, share travel blogs, act as a tour guide, and
build community. Ships with a **web app** for members and a **control-panel** for admins.

Built as a **monorepo** with **Clean Architecture** + **event-driven** design.

---

## Product pillars

| Pillar | Description |
|--------|-------------|
| 🏎 **Car & Bike Posts** | Rich-text posts with up to **20 images**, reviews & comments |
| 🛒 **Marketplace** | Buy/sell listings with **buyer & seller KYC** and admin approvals |
| ✈️ **Travel & Tour Guide** | Travel blogs and guided-tour listings |
| 👥 **Community** | Groups, memberships, feeds |
| 🛠 **Control-Panel** | Masters, RBAC, user management, moderation, KYC review, audit |

## Tech stack

| Layer | Technology |
|-------|------------|
| Web app & Control-panel | **React 18 + Vite + Bootstrap 5** (react-bootstrap), react-quill rich text |
| Backend API | **Java 21 + Spring Boot 3.3** — Clean Architecture, JWT, Spring Kafka |
| Database | **PostgreSQL 16** + Flyway migrations |
| Messaging | **Kafka** (KRaft) via transactional **Outbox** pattern |
| Infra | **Docker + Docker Compose** |

## Repository layout

```
Automobiles/
├─ backend/          Spring Boot API (clean + event-driven architecture)
├─ web-app/          React public/community app  (port 5173)
├─ control-panel/    React admin app             (port 5174)
├─ db/init/          Postgres bootstrap (creates the 4 env databases)
├─ docs/             Product, architecture, agile & design documentation
├─ docker-compose.yml
├─ Makefile
└─ .env.example
```

## Architecture at a glance

- **Clean Architecture** per bounded context (`identity`, `catalog`, `media`, `engagement`,
  `marketplace`, `travel`, `community`, `adminops`): layers `domain → application → interfaces`
  with `infrastructure` implementing the ports. See [docs/architecture/clean-architecture.md](docs/architecture/clean-architecture.md).
- **Event-driven** via a transactional **Outbox** relayed to Kafka — state changes and event
  publication commit atomically, consumers are idempotent. See [docs/architecture/event-driven-architecture.md](docs/architecture/event-driven-architecture.md).
- **RBAC** with 8 roles and `resource:action` permissions enforced by JWT + method security.
  See [docs/architecture/rbac.md](docs/architecture/rbac.md).

## Quick start

Prerequisites: **Docker + Docker Compose**.

```bash
cp .env.example .env
docker compose up --build
```

Then open:

| Service | URL |
|---------|-----|
| Web app | http://localhost:5173 |
| Control-panel | http://localhost:5174 |
| API / Swagger | http://localhost:8080/swagger-ui.html |
| Adminer (DB UI) | http://localhost:8081 |

Default admin: `admin@autohub.local` / `Admin@12345` (change immediately).

> **Frontend dev mode** (hot reload): `cd web-app && npm install && npm run dev`
> (and likewise in `control-panel`). The backend still runs via Docker.

## Databases

Four environment databases are created automatically on first start, owned by role
`automobiles`:

`AutomobilesDB_Dev` · `AutomobilesDB_QA` · `AutomobilesDB_UAT` · `AutomobilesDB_PROD`

> ⚠️ **Security note:** the dev database password is committed in `.env.example` /
> `db/init` **only for local convenience**, as requested. QA/UAT/PROD must source credentials
> from a secrets manager — see [docs/architecture/security-kyc.md](docs/architecture/security-kyc.md).

## Documentation

Start at the **[docs index](docs/README.md)** — product vision, epics & user stories, test
cases, architecture, ADRs, the Scrum sprint plan, the live [progress tracker](docs/agile/progress-tracker.md),
and the design system.

## Project status

**Sprint 0 (Foundation) — complete:** monorepo, Docker stack, Postgres + Flyway schema, RBAC
seed, JWT auth reference slice, event-driven Outbox core, both React apps scaffolded, and the
full documentation set. Feature sprints S1–S5 are planned in [docs/agile/sprint-plan.md](docs/agile/sprint-plan.md).
