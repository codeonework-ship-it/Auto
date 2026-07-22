package com.autohub.engagement.interfaces.web.dto;

import com.autohub.engagement.infrastructure.persistence.ReviewEntity;

import java.time.Instant;

public record ReviewResponse(String id, String postId, String authorId, int rating,
                             String body, String status, Instant createdAt) {

    public static ReviewResponse from(ReviewEntity e) {
        return new ReviewResponse(e.getId().toString(), e.getPostId().toString(),
                e.getAuthorId().toString(), e.getRating(), e.getBody(), e.getStatus(), e.getCreatedAt());
    }
}
