package com.autohub.engagement.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * Join row linking a review to a review tag (table {@code review_tag_links}).
 * Composite PK (reviewId, tagId) via {@link ReviewTagLinkId}. The {@code tag_id}
 * references the adminops {@code master_review_tags} master.
 */
@Entity
@Table(name = "review_tag_links")
@IdClass(ReviewTagLinkId.class)
public class ReviewTagLinkEntity {

    @Id
    @Column(name = "review_id", nullable = false)
    private UUID reviewId;

    @Id
    @Column(name = "tag_id", nullable = false)
    private UUID tagId;

    protected ReviewTagLinkEntity() { }

    public ReviewTagLinkEntity(UUID reviewId, UUID tagId) {
        this.reviewId = reviewId;
        this.tagId = tagId;
    }

    public UUID getReviewId() { return reviewId; }
    public UUID getTagId() { return tagId; }
}
