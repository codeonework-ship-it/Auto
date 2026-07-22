package com.autohub.travel.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/** Persistence model for a travel blog post (table {@code travel_posts}). */
@Entity
@Table(name = "travel_posts")
public class TravelPostEntity {

    @Id
    private UUID id;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "body_html", columnDefinition = "text")
    private String bodyHtml;             // sanitized rich text

    @Column(name = "location")
    private String location;

    @Column(nullable = false)
    private String status;               // DRAFT | PUBLISHED | ARCHIVED

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected TravelPostEntity() { }

    public TravelPostEntity(UUID id, UUID authorId, String title, String slug,
                            String bodyHtml, String location) {
        this.id = id;
        this.authorId = authorId;
        this.title = title;
        this.slug = slug;
        this.bodyHtml = bodyHtml;
        this.location = location;
        this.status = "DRAFT";
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getAuthorId() { return authorId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSlug() { return slug; }
    public String getBodyHtml() { return bodyHtml; }
    public void setBodyHtml(String bodyHtml) { this.bodyHtml = bodyHtml; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }
    public Instant getCreatedAt() { return createdAt; }
}
