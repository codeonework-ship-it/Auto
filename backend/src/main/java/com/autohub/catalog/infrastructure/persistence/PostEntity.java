package com.autohub.catalog.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/** Persistence model for a car/bike post (table {@code posts}). */
@Entity
@Table(name = "posts")
public class PostEntity {

    @Id
    private UUID id;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(nullable = false)
    private String kind;                 // CAR | BIKE

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "body_html", columnDefinition = "text")
    private String bodyHtml;             // sanitized rich text

    @Column(name = "make_id")
    private UUID makeId;

    @Column(name = "model_id")
    private UUID modelId;

    @Column(name = "variant_id")
    private UUID variantId;

    @Column(nullable = false)
    private String status;               // DRAFT | PUBLISHED | ARCHIVED | REMOVED

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected PostEntity() { }

    public PostEntity(UUID id, UUID authorId, String kind, String title, String slug,
                      String bodyHtml, UUID makeId, UUID modelId, UUID variantId) {
        this.id = id;
        this.authorId = authorId;
        this.kind = kind;
        this.title = title;
        this.slug = slug;
        this.bodyHtml = bodyHtml;
        this.makeId = makeId;
        this.modelId = modelId;
        this.variantId = variantId;
        this.status = "DRAFT";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void touch() { this.updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public UUID getAuthorId() { return authorId; }
    public String getKind() { return kind; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSlug() { return slug; }
    public String getBodyHtml() { return bodyHtml; }
    public void setBodyHtml(String bodyHtml) { this.bodyHtml = bodyHtml; }
    public UUID getMakeId() { return makeId; }
    public void setMakeId(UUID makeId) { this.makeId = makeId; }
    public UUID getModelId() { return modelId; }
    public void setModelId(UUID modelId) { this.modelId = modelId; }
    public UUID getVariantId() { return variantId; }
    public void setVariantId(UUID variantId) { this.variantId = variantId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
