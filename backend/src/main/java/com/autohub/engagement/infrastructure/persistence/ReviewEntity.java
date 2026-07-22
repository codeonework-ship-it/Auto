package com.autohub.engagement.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;
import java.util.UUID;

/** Persistence model for a post review (table {@code reviews}); one per author per post. */
@Entity
@Table(name = "reviews", uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "author_id"}))
public class ReviewEntity {

    @Id
    private UUID id;

    @Column(name = "post_id", nullable = false)
    private UUID postId;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(nullable = false)
    private short rating;

    @Column(columnDefinition = "text")
    private String body;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected ReviewEntity() { }

    public ReviewEntity(UUID id, UUID postId, UUID authorId, short rating, String body, String status) {
        this.id = id;
        this.postId = postId;
        this.authorId = authorId;
        this.rating = rating;
        this.body = body;
        this.status = status;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getPostId() { return postId; }
    public UUID getAuthorId() { return authorId; }
    public short getRating() { return rating; }
    public void setRating(short rating) { this.rating = rating; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
