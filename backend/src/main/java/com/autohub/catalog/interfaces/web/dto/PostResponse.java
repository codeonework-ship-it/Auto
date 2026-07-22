package com.autohub.catalog.interfaces.web.dto;

import com.autohub.catalog.infrastructure.persistence.PostEntity;
import com.autohub.catalog.infrastructure.persistence.PostImageEntity;

import java.time.Instant;
import java.util.List;

public record PostResponse(String id, String kind, String title, String slug, String bodyHtml,
                           String status, String authorId, String makeId, String modelId, String variantId,
                           Instant publishedAt, Instant createdAt, Instant updatedAt,
                           List<PostImageResponse> images) {

    public static PostResponse from(PostEntity e, List<PostImageEntity> images) {
        return new PostResponse(
                e.getId().toString(), e.getKind(), e.getTitle(), e.getSlug(), e.getBodyHtml(),
                e.getStatus(), e.getAuthorId().toString(),
                str(e.getMakeId()), str(e.getModelId()), str(e.getVariantId()),
                e.getPublishedAt(), e.getCreatedAt(), e.getUpdatedAt(),
                images.stream().map(PostImageResponse::from).toList());
    }

    private static String str(Object o) {
        return o == null ? null : o.toString();
    }
}
