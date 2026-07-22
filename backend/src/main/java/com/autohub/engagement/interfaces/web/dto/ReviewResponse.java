package com.autohub.engagement.interfaces.web.dto;

import com.autohub.engagement.infrastructure.persistence.ReviewEntity;

import java.time.Instant;
import java.util.List;

public record ReviewResponse(String id, String postId, String authorId, int rating,
                             String body, String status, Instant createdAt, List<String> tagIds) {

    public static ReviewResponse from(ReviewEntity e) {
        return from(e, List.of());
    }

    public static ReviewResponse from(ReviewEntity e, List<String> tagIds) {
        return new ReviewResponse(e.getId().toString(), e.getPostId().toString(),
                e.getAuthorId().toString(), e.getRating(), e.getBody(), e.getStatus(),
                e.getCreatedAt(), tagIds == null ? List.of() : tagIds);
    }
}
