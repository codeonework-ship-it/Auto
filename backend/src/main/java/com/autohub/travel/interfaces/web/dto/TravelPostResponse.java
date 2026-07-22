package com.autohub.travel.interfaces.web.dto;

import com.autohub.travel.infrastructure.persistence.TravelPostEntity;

import java.time.Instant;

public record TravelPostResponse(String id, String title, String slug, String bodyHtml, String location,
                                 String status, String authorId, Instant publishedAt, Instant createdAt) {

    public static TravelPostResponse from(TravelPostEntity e) {
        return new TravelPostResponse(
                e.getId().toString(), e.getTitle(), e.getSlug(), e.getBodyHtml(), e.getLocation(),
                e.getStatus(), e.getAuthorId().toString(), e.getPublishedAt(), e.getCreatedAt());
    }
}
