package com.autohub.marketplace.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Persistence model for an offer on a listing (table {@code listing_offers}). */
@Entity
@Table(name = "listing_offers")
public class OfferEntity {

    @Id
    private UUID id;

    @Column(name = "listing_id", nullable = false)
    private UUID listingId;

    @Column(name = "buyer_id", nullable = false)
    private UUID buyerId;

    @Column(precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(columnDefinition = "text")
    private String message;

    @Column(nullable = false)
    private String status;               // OPEN | ACCEPTED | DECLINED | WITHDRAWN

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected OfferEntity() { }

    public OfferEntity(UUID id, UUID listingId, UUID buyerId, BigDecimal amount,
                       String message, String status) {
        this.id = id;
        this.listingId = listingId;
        this.buyerId = buyerId;
        this.amount = amount;
        this.message = message;
        this.status = status;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getListingId() { return listingId; }
    public UUID getBuyerId() { return buyerId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
