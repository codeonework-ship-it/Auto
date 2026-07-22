package com.autohub.marketplace.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Persistence model for a marketplace listing (table {@code marketplace_listings}). */
@Entity
@Table(name = "marketplace_listings")
public class ListingEntity {

    @Id
    private UUID id;

    @Column(name = "seller_id", nullable = false)
    private UUID sellerId;

    @Column(name = "post_id")
    private UUID postId;

    @Column(nullable = false)
    private String title;

    @Column(name = "description_html", columnDefinition = "text")
    private String descriptionHtml;      // sanitized rich text

    @Column(name = "price_amount", precision = 14, scale = 2)
    private BigDecimal priceAmount;

    @Column(length = 3)
    private String currency;

    @Column(name = "city_id")
    private UUID cityId;

    @Column(nullable = false)
    private String status;               // DRAFT | PENDING_REVIEW | ACTIVE | SOLD | REJECTED | CLOSED

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    protected ListingEntity() { }

    public ListingEntity(UUID id, UUID sellerId, UUID postId, String title, String descriptionHtml,
                         BigDecimal priceAmount, String currency, UUID cityId, String status) {
        this.id = id;
        this.sellerId = sellerId;
        this.postId = postId;
        this.title = title;
        this.descriptionHtml = descriptionHtml;
        this.priceAmount = priceAmount;
        this.currency = currency;
        this.cityId = cityId;
        this.status = status;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void touch() { this.updatedAt = Instant.now(); }

    public UUID getId() { return id; }
    public UUID getSellerId() { return sellerId; }
    public UUID getPostId() { return postId; }
    public void setPostId(UUID postId) { this.postId = postId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescriptionHtml() { return descriptionHtml; }
    public void setDescriptionHtml(String descriptionHtml) { this.descriptionHtml = descriptionHtml; }
    public BigDecimal getPriceAmount() { return priceAmount; }
    public void setPriceAmount(BigDecimal priceAmount) { this.priceAmount = priceAmount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public UUID getCityId() { return cityId; }
    public void setCityId(UUID cityId) { this.cityId = cityId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
