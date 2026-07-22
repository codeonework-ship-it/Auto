package com.autohub.catalog.interfaces.web.dto;

import com.autohub.catalog.infrastructure.persistence.PostImageEntity;

public record PostImageResponse(String id, String url, String contentType, long sizeBytes,
                                Integer width, Integer height, int position) {

    public static PostImageResponse from(PostImageEntity e) {
        return new PostImageResponse(e.getId().toString(), e.getUrl(), e.getContentType(),
                e.getSizeBytes(), e.getWidth(), e.getHeight(), e.getPosition());
    }
}
