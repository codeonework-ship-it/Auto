package com.autohub.engagement.infrastructure.persistence;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

/**
 * Composite primary key for {@link ReviewTagLinkEntity} — mirrors the
 * {@code review_tag_links(review_id, tag_id)} primary key.
 */
public class ReviewTagLinkId implements Serializable {

    private UUID reviewId;
    private UUID tagId;

    public ReviewTagLinkId() { }

    public ReviewTagLinkId(UUID reviewId, UUID tagId) {
        this.reviewId = reviewId;
        this.tagId = tagId;
    }

    public UUID getReviewId() { return reviewId; }
    public UUID getTagId() { return tagId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ReviewTagLinkId that)) return false;
        return Objects.equals(reviewId, that.reviewId) && Objects.equals(tagId, that.tagId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(reviewId, tagId);
    }
}
