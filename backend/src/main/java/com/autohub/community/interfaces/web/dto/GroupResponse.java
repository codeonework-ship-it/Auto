package com.autohub.community.interfaces.web.dto;

import com.autohub.community.infrastructure.persistence.CommunityEntity;

import java.time.Instant;

/** Community group view including its current member count. */
public record GroupResponse(String id, String name, String slug, String description,
                            String ownerId, long memberCount, Instant createdAt) {

    public static GroupResponse of(CommunityEntity e, long memberCount) {
        return new GroupResponse(e.getId().toString(), e.getName(), e.getSlug(), e.getDescription(),
                e.getOwnerId().toString(), memberCount, e.getCreatedAt());
    }
}
