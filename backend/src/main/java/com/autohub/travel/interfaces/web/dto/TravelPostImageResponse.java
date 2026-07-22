package com.autohub.travel.interfaces.web.dto;

import com.autohub.travel.infrastructure.persistence.TravelPostImageEntity;

public record TravelPostImageResponse(String id, String url, String contentType, long sizeBytes,
                                      Integer width, Integer height, int position) {

    public static TravelPostImageResponse from(TravelPostImageEntity e) {
        return new TravelPostImageResponse(e.getId().toString(), e.getUrl(), e.getContentType(),
                e.getSizeBytes(), e.getWidth(), e.getHeight(), e.getPosition());
    }
}
