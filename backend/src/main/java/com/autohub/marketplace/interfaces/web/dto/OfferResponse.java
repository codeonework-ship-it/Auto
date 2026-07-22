package com.autohub.marketplace.interfaces.web.dto;

import com.autohub.marketplace.infrastructure.persistence.OfferEntity;

import java.math.BigDecimal;
import java.time.Instant;

public record OfferResponse(String id, String listingId, String buyerId, BigDecimal amount,
                            String message, String status, Instant createdAt) {

    public static OfferResponse from(OfferEntity e) {
        return new OfferResponse(e.getId().toString(), e.getListingId().toString(),
                e.getBuyerId().toString(), e.getAmount(), e.getMessage(),
                e.getStatus(), e.getCreatedAt());
    }
}
