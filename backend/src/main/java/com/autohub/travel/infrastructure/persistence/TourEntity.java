package com.autohub.travel.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Persistence model for a guided tour offer (table {@code tours}). */
@Entity
@Table(name = "tours")
public class TourEntity {

    @Id
    private UUID id;

    @Column(name = "guide_id", nullable = false)
    private UUID guideId;

    @Column(nullable = false)
    private String title;

    @Column(name = "description_html", columnDefinition = "text")
    private String descriptionHtml;      // sanitized rich text

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(name = "destination")
    private String destination;

    @Column(name = "duration_days")
    private Integer durationDays;

    @Column(name = "price_amount", precision = 14, scale = 2)
    private BigDecimal priceAmount;

    @Column(name = "currency", length = 3)
    private String currency;

    @Column(nullable = false)
    private String status;               // DRAFT | PUBLISHED | ARCHIVED

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected TourEntity() { }

    public TourEntity(UUID id, UUID guideId, String title, String descriptionHtml, UUID categoryId,
                      String destination, Integer durationDays, BigDecimal priceAmount, String currency) {
        this.id = id;
        this.guideId = guideId;
        this.title = title;
        this.descriptionHtml = descriptionHtml;
        this.categoryId = categoryId;
        this.destination = destination;
        this.durationDays = durationDays;
        this.priceAmount = priceAmount;
        this.currency = currency;
        this.status = "PUBLISHED";
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getGuideId() { return guideId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescriptionHtml() { return descriptionHtml; }
    public void setDescriptionHtml(String descriptionHtml) { this.descriptionHtml = descriptionHtml; }
    public UUID getCategoryId() { return categoryId; }
    public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }
    public BigDecimal getPriceAmount() { return priceAmount; }
    public void setPriceAmount(BigDecimal priceAmount) { this.priceAmount = priceAmount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
