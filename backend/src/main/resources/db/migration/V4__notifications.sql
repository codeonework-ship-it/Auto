-- ============================================================================
-- AutoHub — V4: user notifications (Notifications epic).
-- (refresh_tokens already exists in V1 and is reused by the auth-hardening work.)
-- ============================================================================
CREATE TABLE notifications (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type         VARCHAR(80) NOT NULL,          -- e.g. LISTING_APPROVED, REVIEW_ADDED, SYSTEM
    title        VARCHAR(200) NOT NULL,
    body         VARCHAR(1000),
    entity_type  VARCHAR(40),                   -- POST | LISTING | REVIEW | ...
    entity_id    VARCHAR(80),
    is_read      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read, created_at);
