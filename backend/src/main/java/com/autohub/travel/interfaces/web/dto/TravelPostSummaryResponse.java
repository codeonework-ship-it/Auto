package com.autohub.travel.interfaces.web.dto;

import com.autohub.travel.infrastructure.persistence.TravelPostEntity;

import java.time.Instant;

public record TravelPostSummaryResponse(String id, String title, String slug, String location,
                                        String status, String authorId, Instant publishedAt,
                                        Instant createdAt) {

    public static TravelPostSummaryResponse of(TravelPostEntity e) {
        return new TravelPostSummaryResponse(e.getId().toString(), e.getTitle(), e.getSlug(),
                e.getLocation(), e.getStatus(), e.getAuthorId().toString(),
                e.getPublishedAt(), e.getCreatedAt());
    }
}
