package com.autohub.marketplace.interfaces.web.dto;

import com.autohub.marketplace.infrastructure.persistence.ListingEntity;

import java.math.BigDecimal;
import java.time.Instant;

public record ListingSummaryResponse(String id, String sellerId, String title, BigDecimal priceAmount,
                                     String currency, String cityId, String status, Instant updatedAt) {

    public static ListingSummaryResponse of(ListingEntity e) {
        return new ListingSummaryResponse(e.getId().toString(), e.getSellerId().toString(),
                e.getTitle(), e.getPriceAmount(), e.getCurrency(),
                e.getCityId() == null ? null : e.getCityId().toString(),
                e.getStatus(), e.getUpdatedAt());
    }
}
