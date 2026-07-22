package com.autohub.travel.interfaces.web.dto;

import com.autohub.travel.infrastructure.persistence.TourEntity;

import java.math.BigDecimal;
import java.time.Instant;

public record TourResponse(String id, String title, String descriptionHtml, String categoryId,
                           String destination, Integer durationDays, BigDecimal priceAmount,
                           String currency, String status, String guideId, Instant createdAt) {

    public static TourResponse from(TourEntity e) {
        return new TourResponse(
                e.getId().toString(), e.getTitle(), e.getDescriptionHtml(),
                e.getCategoryId() == null ? null : e.getCategoryId().toString(),
                e.getDestination(), e.getDurationDays(), e.getPriceAmount(), e.getCurrency(),
                e.getStatus(), e.getGuideId().toString(), e.getCreatedAt());
    }
}
