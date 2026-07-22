-- ============================================================================
-- AutoHub — V6: image galleries for travel blog posts (mirrors post_images).
-- ============================================================================
CREATE TABLE travel_post_images (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    travel_post_id UUID NOT NULL REFERENCES travel_posts(id) ON DELETE CASCADE,
    url            VARCHAR(500) NOT NULL,
    content_type   VARCHAR(40)  NOT NULL,
    size_bytes     BIGINT       NOT NULL,
    width          INT,
    height         INT,
    position       INT NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_travel_post_images_post ON travel_post_images(travel_post_id);
