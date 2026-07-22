-- ============================================================================
-- AutoHub — V1 core schema (Flyway)
-- Bounded contexts: identity, adminops(masters), catalog, media, engagement,
-- marketplace, travel, community, plus cross-cutting outbox + audit.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- IDENTITY & RBAC
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    username        VARCHAR(60)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(120),
    status          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE|SUSPENDED|BANNED|PENDING
    email_verified  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(40) NOT NULL UNIQUE,   -- SUPER_ADMIN, ADMIN, ...
    name        VARCHAR(80) NOT NULL,
    description VARCHAR(255)
);

CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(80) NOT NULL UNIQUE,   -- resource:action, e.g. post:create
    description VARCHAR(255)
);

CREATE TABLE role_permissions (
    role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- KYC (buyer & seller)
-- ---------------------------------------------------------------------------
CREATE TABLE kyc_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kyc_type        VARCHAR(10) NOT NULL,        -- BUYER | SELLER
    legal_name      VARCHAR(160) NOT NULL,
    document_type   VARCHAR(40)  NOT NULL,       -- PASSPORT|DRIVERS_LICENSE|NATIONAL_ID|GST
    document_number VARCHAR(80)  NOT NULL,
    phone           VARCHAR(30),
    address_line    VARCHAR(255),
    city            VARCHAR(120),
    country         VARCHAR(120),
    status          VARCHAR(20)  NOT NULL DEFAULT 'DRAFT', -- DRAFT|SUBMITTED|UNDER_REVIEW|APPROVED|REJECTED
    reviewer_id     UUID REFERENCES users(id),
    review_notes    VARCHAR(500),
    submitted_at    TIMESTAMPTZ,
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, kyc_type)
);

-- ---------------------------------------------------------------------------
-- ADMINOPS — MASTERS (reference data managed in the control-panel)
-- ---------------------------------------------------------------------------
CREATE TABLE vehicle_makes (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name    VARCHAR(80) NOT NULL UNIQUE,
    kind    VARCHAR(10) NOT NULL,       -- CAR | BIKE | BOTH
    active  BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE vehicle_models (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    make_id  UUID NOT NULL REFERENCES vehicle_makes(id) ON DELETE CASCADE,
    name     VARCHAR(120) NOT NULL,
    active   BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (make_id, name)
);
CREATE TABLE vehicle_variants (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id  UUID NOT NULL REFERENCES vehicle_models(id) ON DELETE CASCADE,
    name      VARCHAR(120) NOT NULL,
    active    BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (model_id, name)
);

-- Generic single-column masters share a simple shape.
CREATE TABLE master_fuel_types    (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(60) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE);
CREATE TABLE master_body_types    (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(60) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE);
CREATE TABLE master_transmissions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(60) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE);
CREATE TABLE master_categories    (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(60) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE);
CREATE TABLE master_cities        (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(120) NOT NULL, country VARCHAR(120), active BOOLEAN NOT NULL DEFAULT TRUE, UNIQUE(name, country));
CREATE TABLE master_currencies    (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), code VARCHAR(3) NOT NULL UNIQUE, name VARCHAR(60) NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE);
CREATE TABLE master_tour_categories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(80) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE);
CREATE TABLE master_review_tags   (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(60) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE);
CREATE TABLE master_report_reasons(id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(120) NOT NULL UNIQUE, active BOOLEAN NOT NULL DEFAULT TRUE);

-- ---------------------------------------------------------------------------
-- CATALOG — car/bike posts   +  MEDIA — images
-- ---------------------------------------------------------------------------
CREATE TABLE posts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id     UUID NOT NULL REFERENCES users(id),
    kind          VARCHAR(10) NOT NULL,          -- CAR | BIKE
    title         VARCHAR(200) NOT NULL,
    slug          VARCHAR(220) NOT NULL UNIQUE,
    body_html     TEXT,                          -- sanitized rich text
    make_id       UUID REFERENCES vehicle_makes(id),
    model_id      UUID REFERENCES vehicle_models(id),
    variant_id    UUID REFERENCES vehicle_variants(id),
    status        VARCHAR(20) NOT NULL DEFAULT 'DRAFT', -- DRAFT|PUBLISHED|ARCHIVED|REMOVED
    published_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);

CREATE TABLE post_images (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id      UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    url          VARCHAR(500) NOT NULL,
    content_type VARCHAR(40)  NOT NULL,
    size_bytes   BIGINT       NOT NULL,
    width        INT,
    height       INT,
    position     INT NOT NULL DEFAULT 0,   -- 0..19 (max 20 images enforced in app layer)
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_post_images_post ON post_images(post_id);

-- ---------------------------------------------------------------------------
-- ENGAGEMENT — reviews & comments  (require a signed-up user)
-- ---------------------------------------------------------------------------
CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL REFERENCES users(id),
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    body        TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'VISIBLE', -- VISIBLE|HIDDEN|FLAGGED
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (post_id, author_id)
);

CREATE TABLE comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL REFERENCES users(id),
    parent_id   UUID REFERENCES comments(id) ON DELETE CASCADE,
    body        TEXT NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'VISIBLE',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comments_post ON comments(post_id);

-- ---------------------------------------------------------------------------
-- MARKETPLACE — buy/sell listings
-- ---------------------------------------------------------------------------
CREATE TABLE marketplace_listings (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id    UUID NOT NULL REFERENCES users(id),
    post_id      UUID REFERENCES posts(id),
    title        VARCHAR(200) NOT NULL,
    description_html TEXT,
    price_amount NUMERIC(14,2) NOT NULL,
    currency     VARCHAR(3) NOT NULL DEFAULT 'USD',
    city_id      UUID REFERENCES master_cities(id),
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING_REVIEW', -- DRAFT|PENDING_REVIEW|ACTIVE|SOLD|REJECTED|CLOSED
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_listings_seller ON marketplace_listings(seller_id);
CREATE INDEX idx_listings_status ON marketplace_listings(status);

CREATE TABLE listing_offers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id  UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    buyer_id    UUID NOT NULL REFERENCES users(id),
    amount      NUMERIC(14,2) NOT NULL,
    message     VARCHAR(500),
    status      VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- OPEN|ACCEPTED|DECLINED|WITHDRAWN
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- TRAVEL — blog posts & tour guide
-- ---------------------------------------------------------------------------
CREATE TABLE travel_posts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id    UUID NOT NULL REFERENCES users(id),
    title        VARCHAR(200) NOT NULL,
    slug         VARCHAR(220) NOT NULL UNIQUE,
    body_html    TEXT,
    location     VARCHAR(160),
    status       VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    published_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tours (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_id       UUID NOT NULL REFERENCES users(id),
    title          VARCHAR(200) NOT NULL,
    description_html TEXT,
    category_id    UUID REFERENCES master_tour_categories(id),
    destination    VARCHAR(160),
    duration_days  INT,
    price_amount   NUMERIC(14,2),
    currency       VARCHAR(3) DEFAULT 'USD',
    status         VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- COMMUNITY — groups & memberships
-- ---------------------------------------------------------------------------
CREATE TABLE communities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(120) NOT NULL UNIQUE,
    slug        VARCHAR(140) NOT NULL UNIQUE,
    description VARCHAR(500),
    owner_id    UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE community_memberships (
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role         VARCHAR(20) NOT NULL DEFAULT 'MEMBER', -- OWNER|MODERATOR|MEMBER
    joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (community_id, user_id)
);

-- ---------------------------------------------------------------------------
-- MODERATION — reports
-- ---------------------------------------------------------------------------
CREATE TABLE reports (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id   UUID NOT NULL REFERENCES users(id),
    subject_type  VARCHAR(20) NOT NULL,  -- POST|COMMENT|REVIEW|LISTING|USER
    subject_id    UUID NOT NULL,
    reason_id     UUID REFERENCES master_report_reasons(id),
    details       VARCHAR(500),
    status        VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- OPEN|REVIEWING|RESOLVED|DISMISSED
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- CROSS-CUTTING — transactional Outbox & Audit log
-- ---------------------------------------------------------------------------
CREATE TABLE outbox_events (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type VARCHAR(80)  NOT NULL,
    aggregate_id   VARCHAR(80)  NOT NULL,
    event_type     VARCHAR(120) NOT NULL,   -- e.g. identity.user.registered
    payload        JSONB        NOT NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'PENDING', -- PENDING|PUBLISHED|FAILED
    attempts       INT          NOT NULL DEFAULT 0,
    occurred_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    published_at   TIMESTAMPTZ
);
CREATE INDEX idx_outbox_status ON outbox_events(status, occurred_at);

CREATE TABLE audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID REFERENCES users(id),
    action      VARCHAR(120) NOT NULL,
    entity_type VARCHAR(80),
    entity_id   VARCHAR(80),
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_actor ON audit_log(actor_id);
