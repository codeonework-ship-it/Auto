package com.autohub.travel.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/** Persistence model for a travel-post image (table {@code travel_post_images}). */
@Entity
@Table(name = "travel_post_images")
public class TravelPostImageEntity {

    @Id
    private UUID id;

    @Column(name = "travel_post_id", nullable = false)
    private UUID travelPostId;

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

    protected TravelPostImageEntity() { }

    public TravelPostImageEntity(UUID id, UUID travelPostId, String url, String contentType,
                                 long sizeBytes, Integer width, Integer height, int position) {
        this.id = id;
        this.travelPostId = travelPostId;
        this.url = url;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
        this.width = width;
        this.height = height;
        this.position = position;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getTravelPostId() { return travelPostId; }
    public String getUrl() { return url; }
    public String getContentType() { return contentType; }
    public long getSizeBytes() { return sizeBytes; }
    public Integer getWidth() { return width; }
    public Integer getHeight() { return height; }
    public int getPosition() { return position; }
    public Instant getCreatedAt() { return createdAt; }
}
