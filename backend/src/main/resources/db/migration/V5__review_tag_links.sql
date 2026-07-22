-- ============================================================================
-- AutoHub — V5: link reviews to review-tag masters (many-to-many).
-- master_review_tags already exists (V1). reviews already exists (V1).
-- ============================================================================
CREATE TABLE review_tag_links (
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    tag_id    UUID NOT NULL REFERENCES master_review_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (review_id, tag_id)
);
CREATE INDEX idx_review_tag_links_review ON review_tag_links(review_id);
