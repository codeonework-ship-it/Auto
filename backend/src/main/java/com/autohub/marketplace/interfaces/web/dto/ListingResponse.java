package com.autohub.marketplace.interfaces.web.dto;

import com.autohub.marketplace.infrastructure.persistence.ListingEntity;

import java.math.BigDecimal;
import java.time.Instant;

public record ListingResponse(String id, String sellerId, String postId, String title,
                              String descriptionHtml, BigDecimal priceAmount, String currency,
                              String cityId, String status, Instant createdAt, Instant updatedAt) {

    public static ListingResponse from(ListingEntity e) {
        return new ListingResponse(
                e.getId().toString(), e.getSellerId().toString(), str(e.getPostId()),
                e.getTitle(), e.getDescriptionHtml(), e.getPriceAmount(), e.getCurrency(),
                str(e.getCityId()), e.getStatus(), e.getCreatedAt(), e.getUpdatedAt());
    }

    private static String str(Object o) {
        return o == null ? null : o.toString();
    }
}
