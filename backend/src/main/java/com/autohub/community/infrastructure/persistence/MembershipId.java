package com.autohub.community.infrastructure.persistence;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

/** Composite primary key for {@link MembershipEntity} (community_id, user_id). */
public class MembershipId implements Serializable {

    private UUID communityId;
    private UUID userId;

    public MembershipId() { }

    public MembershipId(UUID communityId, UUID userId) {
        this.communityId = communityId;
        this.userId = userId;
    }

    public UUID getCommunityId() { return communityId; }
    public UUID getUserId() { return userId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MembershipId that)) return false;
        return Objects.equals(communityId, that.communityId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(communityId, userId);
    }
}
