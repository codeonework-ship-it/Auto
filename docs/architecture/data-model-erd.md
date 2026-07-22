# Data Model & ERD

This document describes the AutoHub relational data model on **PostgreSQL 16**. The schema is
owned by role `automobiles`, versioned with **Flyway** (see [ADR-0005](adr/0005-postgres-flyway.md)),
and identical across the four environment databases (`AutomobilesDB_Dev`, `_QA`, `_UAT`,
`_PROD`).

Conventions: surrogate primary keys (`UUID` for user-generated aggregates, `BIGSERIAL` for
master/lookup tables), `created_at` / `updated_at` audit columns on mutable tables, and soft
deletes where content moderation requires history.

## Entity–Relationship Diagram

```mermaid
erDiagram
    users ||--o{ user_roles : has
    roles ||--o{ user_roles : granted_by
    roles ||--o{ role_permissions : has
    permissions ||--o{ role_permissions : in
    users ||--o| kyc_profiles : owns
    users ||--o{ posts : authors
    users ||--o{ reviews : writes
    users ||--o{ comments : writes
    users ||--o{ marketplace_listings : lists
    users ||--o{ listing_offers : makes
    users ||--o{ travel_posts : authors
    users ||--o{ tours : guides
    users ||--o{ memberships : joins
    users ||--o{ reports : files
    users ||--o{ audit_log : acts

    vehicle_makes ||--o{ vehicle_models : has
    vehicle_models ||--o{ vehicle_variants : has
    vehicle_makes ||--o{ posts : tagged
    vehicle_models ||--o{ posts : tagged
    vehicle_variants ||--o{ posts : tagged

    posts ||--o{ post_images : contains
    posts ||--o{ reviews : receives
    posts ||--o{ comments : receives
    posts ||--o{ marketplace_listings : source_of
    posts ||--o{ reports : subject_of

    marketplace_listings ||--o{ listing_offers : receives
    marketplace_listings ||--o{ reports : subject_of

    communities ||--o{ memberships : has
    tours ||--o{ travel_posts : linked_to

    fuel_type ||--o{ vehicle_variants : classifies
    body_type ||--o{ posts : classifies
    transmission ||--o{ vehicle_variants : classifies
    category ||--o{ posts : classifies
    city ||--o{ posts : located_in
    city ||--o{ marketplace_listings : located_in
    city ||--o{ tours : located_in

    users {
        uuid id PK
        string email UK
        string password_hash
        string display_name
        string status
        timestamptz created_at
        timestamptz updated_at
    }
    roles {
        bigserial id PK
        string code UK
        string name
        string description
    }
    permissions {
        bigserial id PK
        string code UK
        string resource
        string action
    }
    role_permissions {
        bigint role_id FK
        bigint permission_id FK
    }
    user_roles {
        uuid user_id FK
        bigint role_id FK
        timestamptz granted_at
    }
    kyc_profiles {
        uuid id PK
        uuid user_id FK
        string kyc_type
        string legal_name
        string document_type
        string document_number
        string document_url
        string status
        string reviewer_note
        uuid reviewed_by FK
        timestamptz submitted_at
        timestamptz reviewed_at
    }
    vehicle_makes {
        bigserial id PK
        string name UK
        string country
        boolean active
    }
    vehicle_models {
        bigserial id PK
        bigint make_id FK
        string name
        boolean active
    }
    vehicle_variants {
        bigserial id PK
        bigint model_id FK
        string name
        bigint fuel_type_id FK
        bigint transmission_id FK
        boolean active
    }
    posts {
        uuid id PK
        uuid author_id FK
        bigint category_id FK
        bigint make_id FK
        bigint model_id FK
        bigint variant_id FK
        bigint body_type_id FK
        bigint city_id FK
        string title
        text body_html
        string status
        int image_count
        timestamptz created_at
        timestamptz updated_at
    }
    post_images {
        uuid id PK
        uuid post_id FK
        string storage_key
        string mime_type
        int width
        int height
        int size_bytes
        int sort_order
    }
    reviews {
        uuid id PK
        uuid post_id FK
        uuid author_id FK
        int rating
        text body_html
        string status
        timestamptz created_at
    }
    comments {
        uuid id PK
        uuid post_id FK
        uuid author_id FK
        uuid parent_id FK
        text body_html
        string status
        timestamptz created_at
    }
    marketplace_listings {
        uuid id PK
        uuid seller_id FK
        uuid post_id FK
        bigint city_id FK
        numeric price
        bigint currency_id FK
        string status
        timestamptz created_at
    }
    listing_offers {
        uuid id PK
        uuid listing_id FK
        uuid buyer_id FK
        numeric amount
        string status
        timestamptz created_at
    }
    travel_posts {
        uuid id PK
        uuid author_id FK
        uuid tour_id FK
        bigint city_id FK
        string title
        text body_html
        string status
        timestamptz created_at
    }
    tours {
        uuid id PK
        uuid guide_id FK
        bigint city_id FK
        bigint tour_category_id FK
        string title
        text description_html
        numeric price
        bigint currency_id FK
        string status
    }
    communities {
        uuid id PK
        string name UK
        text description
        uuid owner_id FK
        timestamptz created_at
    }
    memberships {
        uuid id PK
        uuid community_id FK
        uuid user_id FK
        string role_in_community
        timestamptz joined_at
    }
    fuel_type {
        bigserial id PK
        string name UK
        boolean active
    }
    body_type {
        bigserial id PK
        string name UK
        boolean active
    }
    transmission {
        bigserial id PK
        string name UK
        boolean active
    }
    category {
        bigserial id PK
        string name UK
        boolean active
    }
    city {
        bigserial id PK
        string name
        string state
        string country
        boolean active
    }
    outbox_events {
        uuid id PK
        uuid event_id UK
        string type
        string aggregate_id
        string aggregate_type
        jsonb payload
        int version
        string status
        int attempts
        timestamptz occurred_at
        timestamptz published_at
    }
    audit_log {
        uuid id PK
        uuid actor_id FK
        string action
        string entity_type
        string entity_id
        jsonb details
        string ip_address
        timestamptz created_at
    }
    reports {
        uuid id PK
        uuid reporter_id FK
        string subject_type
        string subject_id
        bigint report_reason_id FK
        text note
        string status
        uuid resolved_by FK
        timestamptz created_at
        timestamptz resolved_at
    }
```

> Mermaid `erDiagram` shows only a curated subset of foreign keys as explicit relationships for
> readability; every `*_id FK` column above is a foreign key at the database level, and the
> master tables (`report_reason`, `currency`, `tour_category`, `review_tag`) referenced by
> `reports`, `marketplace_listings`, `tours` and reviews follow the same `bigserial id PK` /
> `active` lookup shape shown for `fuel_type` etc.

## Table Descriptions

### Identity & RBAC

| Table | Description |
|-------|-------------|
| `users` | Registered accounts. Holds email (unique), bcrypt `password_hash`, display name and account `status`. Root of most content aggregates. |
| `roles` | RBAC roles. `code` is one of the fixed set (SUPER_ADMIN, ADMIN, MODERATOR, SELLER, BUYER, AUTHOR, MEMBER, GUEST). |
| `permissions` | Fine-grained permissions in `resource:action` form (e.g. `post:create`). `resource` and `action` are also stored split for querying. |
| `role_permissions` | Many-to-many join between roles and permissions. Defines what each role can do. |
| `user_roles` | Many-to-many join granting roles to users, with `granted_at`. |
| `kyc_profiles` | One KYC dossier per user (buyer or seller). Holds legal name, document type/number/URL, and the review state machine (`status`: DRAFT/SUBMITTED/UNDER_REVIEW/APPROVED/REJECTED) plus reviewer note and reviewer id. |

### Vehicle Reference (car/bike taxonomy)

| Table | Description |
|-------|-------------|
| `vehicle_makes` | Manufacturers (e.g. Toyota, Honda). Master data. |
| `vehicle_models` | Models under a make (FK `make_id`). |
| `vehicle_variants` | Variants/trims under a model (FK `model_id`), classified by `fuel_type` and `transmission`. |

### Content — Catalog & Engagement

| Table | Description |
|-------|-------------|
| `posts` | Car/bike posts. References taxonomy (make/model/variant/body_type/category), `city`, author, rich-text `body_html`, moderation `status`, and a denormalized `image_count` (≤20). |
| `post_images` | Images attached to a post. Stores object-store `storage_key`, `mime_type`, `width`/`height`, `size_bytes`, `sort_order`. Enforces upload rules at write time. |
| `reviews` | Ratings + rich-text reviews on a post. `rating` 1–5. Moderatable `status`. |
| `comments` | Threaded comments on a post (`parent_id` self-reference). Requires a signed-in account. Moderatable `status`. |

### Marketplace

| Table | Description |
|-------|-------------|
| `marketplace_listings` | A for-sale listing, usually derived from a `post`. Seller must have APPROVED KYC. Holds `price`, `currency`, `city`, and `status` (DRAFT/PENDING/APPROVED/SOLD/REJECTED). |
| `listing_offers` | Buyer offers against a listing. Holds `amount` and negotiation `status`. |

### Travel & Community

| Table | Description |
|-------|-------------|
| `travel_posts` | Travel blog entries, optionally linked to a `tour`, located in a `city`. |
| `tours` | Tour-guide offerings by a guide user, with `tour_category`, `city`, `price`/`currency`, and `status`. |
| `communities` | Community groups with an owner. |
| `memberships` | Join between users and communities, with a per-community role. |

### Masters (lookup tables)

| Table | Description |
|-------|-------------|
| `fuel_type` | Petrol, Diesel, Electric, Hybrid, CNG, … |
| `body_type` | Sedan, SUV, Hatchback, Cruiser, Sport, … |
| `transmission` | Manual, Automatic, CVT, DCT, … |
| `category` | Top-level category: `car` or `bike`. |
| `city` | Cities with state/country, used across posts, listings and tours. |

(Additional master tables — `currency`, `tour_category`, `review_tag`, `report_reason` — plus
`roles`/`permissions` are also managed as Masters in the control-panel.)

### Platform / Cross-cutting

| Table | Description |
|-------|-------------|
| `outbox_events` | Transactional Outbox. One row per domain event written in the same TX as the business change; relayed to Kafka. Holds the full envelope (`event_id`, `type`, `aggregate_id`, `payload` JSONB, `version`) and relay state (`status`, `attempts`, `published_at`). See [event-driven-architecture.md](event-driven-architecture.md). |
| `audit_log` | Immutable record of security-relevant and admin actions: actor, action, target entity, JSON details, IP, timestamp. See [security-kyc.md](security-kyc.md#audit-logging). |
| `reports` | User-filed reports against content (post/listing/comment/review). References a `report_reason` master and tracks resolution. |

## Related Documents

- [overview.md](overview.md)
- [event-driven-architecture.md](event-driven-architecture.md)
- [rbac.md](rbac.md)
- [ADR-0005 PostgreSQL + Flyway](adr/0005-postgres-flyway.md)
