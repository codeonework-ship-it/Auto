-- ============================================================================
-- AutoHub — V7: product catalog (MOTORA marketplace showcase backing store).
-- A catalog-of-record for sellable/browsable machines, distinct from community
-- posts. Images are original generated SVGs stored in product_images and
-- served by the API. Seeded idempotently by ProductCatalogSeeder (100 rows).
-- ============================================================================

CREATE TABLE products (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug         VARCHAR(180) NOT NULL UNIQUE,
    type         VARCHAR(8)   NOT NULL,            -- CAR | BIKE
    brand        VARCHAR(60)  NOT NULL,
    model        VARCHAR(140) NOT NULL,
    category     VARCHAR(30)  NOT NULL,            -- suv/sedan/... or sports/cruiser/...
    price        NUMERIC(14,2),                    -- nullable => price on request
    searches     INT          NOT NULL DEFAULT 0,
    rating       NUMERIC(2,1) NOT NULL DEFAULT 0,
    review_count INT          NOT NULL DEFAULT 0,
    availability VARCHAR(20)  NOT NULL DEFAULT 'New',  -- New|Upcoming|Discontinued
    fuel         VARCHAR(20)  NOT NULL,
    transmission VARCHAR(40),
    drivetrain   VARCHAR(10),                      -- cars
    seating      INT,                              -- cars
    power        VARCHAR(30),
    torque       VARCHAR(30),
    mileage      VARCHAR(30),                      -- km/l or "NNN km range"
    safety       INT,                              -- cars: star rating
    adas         BOOLEAN,                          -- cars
    sunroof      BOOLEAN,                          -- cars
    kerb         VARCHAR(20),                      -- bikes
    seat_height  VARCHAR(20),                      -- bikes
    abs_type     VARCHAR(60),                      -- bikes
    cooling      VARCHAR(20),                      -- bikes
    charge_time  VARCHAR(40),                      -- EVs
    highlight    VARCHAR(200),
    hue          INT NOT NULL DEFAULT 210,         -- deterministic art hue
    tags         TEXT,                             -- '|' separated
    colors       TEXT,                             -- '|' separated
    pros         TEXT,                             -- '|' separated
    cons         TEXT,                             -- '|' separated
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_searches ON products(searches DESC);

CREATE TABLE product_variants (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name       VARCHAR(60) NOT NULL,
    price      NUMERIC(14,2),
    power      VARCHAR(30),
    mileage    VARCHAR(30),
    position   INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);

CREATE TABLE product_spec_rows (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    grp        VARCHAR(60)  NOT NULL,              -- e.g. "Engine & Performance"
    k          VARCHAR(60)  NOT NULL,
    v          VARCHAR(200) NOT NULL,
    position   INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_product_spec_rows_product ON product_spec_rows(product_id);

CREATE TABLE product_images (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    position   INT NOT NULL DEFAULT 0,
    label      VARCHAR(40),
    svg        TEXT NOT NULL,                      -- original generated SVG artwork
    CONSTRAINT uq_product_image UNIQUE (product_id, position)
);

CREATE TABLE product_reviews (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    author       VARCHAR(80) NOT NULL,
    rating       NUMERIC(2,1) NOT NULL,
    title        VARCHAR(140) NOT NULL,
    content      TEXT NOT NULL,
    review_date  VARCHAR(12) NOT NULL,
    verified     BOOLEAN NOT NULL DEFAULT TRUE,
    ownership    VARCHAR(30) NOT NULL DEFAULT 'Owner',
    variant_name VARCHAR(60),
    pros         TEXT,                             -- '|' separated
    cons         TEXT,                             -- '|' separated
    helpful      INT NOT NULL DEFAULT 0,
    position     INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_product_reviews_product ON product_reviews(product_id);
