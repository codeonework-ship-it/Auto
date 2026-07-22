package com.autohub.engagement.interfaces.web.dto;

import com.autohub.engagement.infrastructure.persistence.CommentEntity;

import java.time.Instant;

public record CommentResponse(String id, String postId, String authorId, String parentId,
                              String body, String status, Instant createdAt) {

    public static CommentResponse from(CommentEntity e) {
        return new CommentResponse(e.getId().toString(), e.getPostId().toString(),
                e.getAuthorId().toString(), e.getParentId() == null ? null : e.getParentId().toString(),
                e.getBody(), e.getStatus(), e.getCreatedAt());
    }
}
