# AutoHub — Epics

> Product epics grouped by the FIVE platform pillars. IDs are FIXED convention (`EP-01`..). Target sprints map to the canonical Sprint Plan (S0–S5). Priority uses MoSCoW (Must / Should / Could).

## Pillars Legend

| Pillar | Meaning |
|---|---|
| **Foundation** | Cross-cutting platform capabilities (auth, RBAC, admin) |
| **Posts** | Car/bike posts, media, rich text, reviews, comments |
| **Marketplace** | Buy/sell listings + KYC |
| **Travel** | Travel blog + tour guide |
| **Community** | Groups, follows, feeds, search, notifications |
| **Trust & Safety** | Moderation, reporting |

## Epic Catalog

| ID | Title | Pillar | Description | Priority | Target Sprint |
|---|---|---|---|---|---|
| **EP-01** | Identity & Authentication | Foundation | Email/password signup, login, logout, JWT sessions, password policy, email uniqueness, profile management. Required before any write action. | Must | S0–S1 |
| **EP-02** | RBAC & User Management | Foundation | 8 fixed roles, `resource:action` permissions, role→permission mapping, assigning roles to users, least-privilege enforcement on API + UI. | Must | S1 |
| **EP-03** | Masters & Control-Panel | Foundation | CRUD for all 14 masters (Make, Model, Variant, Fuel Type, Body Type, Transmission, Category, Location/City, Currency, Tour Category, Review Tag, Report Reason, Role, Permission). | Must | S1 |
| **EP-04** | Car & Bike Posts (Catalog) | Posts | Create/read/update/delete car & bike posts using Masters, categorized car/bike, specs, status (draft/published). | Must | S2 |
| **EP-05** | Image Upload & Media | Posts | 20-image uploader with type (JPEG/PNG/WEBP), size (≤5 MB), and resolution (≥640×480) validation; media storage; ordering; orphan cleanup. | Must | S2 |
| **EP-06** | Rich Text Content | Posts | react-quill editor for posts, travel blogs, reviews; server-side sanitization against XSS; safe HTML rendering. | Must | S2 |
| **EP-07** | Reviews & Comments | Posts | Post reviews (rating + tags) and threaded comments. Commenting requires an authenticated account. Review tags from Masters. | Must | S3 |
| **EP-08** | Marketplace Listings | Marketplace | Create/manage buy-sell listings with lifecycle (DRAFT → PENDING_REVIEW → ACTIVE → SOLD/EXPIRED/REJECTED), admin approval, contact reveal. | Must | S4 |
| **EP-09** | KYC (Buyer & Seller) | Marketplace | Buyer and seller KYC forms, document upload, review workflow (`kyc:review`), status (PENDING/APPROVED/REJECTED), gating of listing/contact actions. | Must | S4 |
| **EP-10** | Travel Blog | Travel | Author long-form travel posts with rich text and image galleries; categorize; publish; engage. | Should | S5 |
| **EP-11** | Tour Guide | Travel | Tour-guide listings tied to Tour Category, location, and price (Currency); availability; booking requests. | Should | S5 |
| **EP-12** | Community (Groups & Follows) | Community | Create/join groups, follow users/authors, personalized activity feed, reputation. | Should | S5 |
| **EP-13** | Search & Feed | Community | Full-text and faceted search across posts, listings, travel; personalized feed ranking; saved searches. | Should | S3–S5 |
| **EP-14** | Notifications | Community | In-app and email notifications for reviews, comments, follows, KYC status, listing status, moderation actions. | Could | S5 |
| **EP-15** | Moderation & Reporting | Trust & Safety | Report content (Report Reason master), moderation queue, actions (hide/remove/warn/suspend/ban), audit trail. | Must | S3 |

## Epic Dependency Map

```
EP-01 Identity ──┬─> EP-02 RBAC ──> EP-03 Masters ──┬─> EP-04 Posts ──> EP-05 Media
                 │                                   │        └──> EP-06 Rich Text
                 │                                   │        └──> EP-07 Reviews/Comments ──> EP-15 Moderation
                 │                                   ├─> EP-08 Marketplace ──> EP-09 KYC
                 │                                   ├─> EP-10 Travel ──> EP-11 Tour Guide
                 │                                   └─> EP-12 Community ──> EP-13 Search/Feed ──> EP-14 Notifications
                 └─> (all write actions require authenticated identity)
```

## Epic → Bounded Context Mapping

| Epic | Primary Bounded Context (package) |
|---|---|
| EP-01, EP-02, EP-09 | `identity` |
| EP-03, EP-15 | `adminops` |
| EP-04, EP-06 | `catalog` |
| EP-05 | `media` |
| EP-07 | `engagement` |
| EP-08 | `marketplace` |
| EP-10, EP-11 | `travel` |
| EP-12, EP-13, EP-14 | `community` |

## Epic Priority Summary

| Priority | Epics | Count |
|---|---|---|
| **Must** | EP-01, EP-02, EP-03, EP-04, EP-05, EP-06, EP-07, EP-08, EP-09, EP-15 | 10 |
| **Should** | EP-10, EP-11, EP-12, EP-13 | 4 |
| **Could** | EP-14 | 1 |

See [`user-stories.md`](./user-stories.md) for the stories under each epic and [`backlog.md`](./backlog.md) for the sprint-level rollup.
