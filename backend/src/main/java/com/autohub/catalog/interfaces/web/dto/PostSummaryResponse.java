package com.autohub.catalog.interfaces.web.dto;

import com.autohub.catalog.infrastructure.persistence.PostEntity;

import java.time.Instant;

public record PostSummaryResponse(String id, String kind, String title, String slug, String status,
                                  String authorId, Instant publishedAt, Instant updatedAt,
                                  long imageCount, String coverUrl) {

    public static PostSummaryResponse of(PostEntity e, long imageCount, String coverUrl) {
        return new PostSummaryResponse(e.getId().toString(), e.getKind(), e.getTitle(), e.getSlug(),
                e.getStatus(), e.getAuthorId().toString(), e.getPublishedAt(), e.getUpdatedAt(),
                imageCount, coverUrl);
    }
}
