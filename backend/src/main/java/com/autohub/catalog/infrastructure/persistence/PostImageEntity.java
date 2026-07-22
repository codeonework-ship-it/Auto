package com.autohub.catalog.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/** Persistence model for a post image (table {@code post_images}). */
@Entity
@Table(name = "post_images")
public class PostImageEntity {

    @Id
    private UUID id;

    @Column(name = "post_id", nullable = false)
    private UUID postId;

    @Column(nullable = false)
    private String url;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Column
    private Integer width;

    @Column
    private Integer height;

    @Column(nullable = false)
    private int position;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected PostImageEntity() { }

    public PostImageEntity(UUID id, UUID postId, String url, String contentType,
                           long sizeBytes, Integer width, Integer height, int position) {
        this.id = id;
        this.postId = postId;
        this.url = url;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
        this.width = width;
        this.height = height;
        this.position = position;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getPostId() { return postId; }
    public String getUrl() { return url; }
    public String getContentType() { return contentType; }
    public long getSizeBytes() { return sizeBytes; }
    public Integer getWidth() { return width; }
    public Integer getHeight() { return height; }
    public int getPosition() { return position; }
    public Instant getCreatedAt() { return createdAt; }
}
