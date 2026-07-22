package com.autohub.travel.interfaces.web.dto;

import com.autohub.travel.infrastructure.persistence.TravelPostEntity;
import com.autohub.travel.infrastructure.persistence.TravelPostImageEntity;

import java.time.Instant;
import java.util.List;

public record TravelPostResponse(String id, String title, String slug, String bodyHtml, String location,
                                 String status, String authorId, Instant publishedAt, Instant createdAt,
                                 List<TravelPostImageResponse> images) {

    public static TravelPostResponse from(TravelPostEntity e, List<TravelPostImageEntity> images) {
        return new TravelPostResponse(
                e.getId().toString(), e.getTitle(), e.getSlug(), e.getBodyHtml(), e.getLocation(),
                e.getStatus(), e.getAuthorId().toString(), e.getPublishedAt(), e.getCreatedAt(),
                images.stream().map(TravelPostImageResponse::from).toList());
    }

    public static TravelPostResponse from(TravelPostEntity e) {
        return from(e, List.of());
    }
}
