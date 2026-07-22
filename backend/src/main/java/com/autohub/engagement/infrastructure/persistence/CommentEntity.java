package com.autohub.engagement.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/** Persistence model for a post comment (table {@code comments}); supports one-level threads. */
@Entity
@Table(name = "comments")
public class CommentEntity {

    @Id
    private UUID id;

    @Column(name = "post_id", nullable = false)
    private UUID postId;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(nullable = false, columnDefinition = "text")
    private String body;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected CommentEntity() { }

    public CommentEntity(UUID id, UUID postId, UUID authorId, UUID parentId, String body, String status) {
        this.id = id;
        this.postId = postId;
        this.authorId = authorId;
        this.parentId = parentId;
        this.body = body;
        this.status = status;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getPostId() { return postId; }
    public UUID getAuthorId() { return authorId; }
    public UUID getParentId() { return parentId; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
