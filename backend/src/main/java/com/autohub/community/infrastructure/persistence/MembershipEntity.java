package com.autohub.community.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/**
 * Persistence model for a community membership (table {@code community_memberships}) with a
 * composite primary key of (community_id, user_id) mapped via {@link MembershipId}.
 */
@Entity
@Table(name = "community_memberships")
@IdClass(MembershipId.class)
public class MembershipEntity {

    @Id
    @Column(name = "community_id", nullable = false)
    private UUID communityId;

    @Id
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String role;                    // OWNER | MODERATOR | MEMBER

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt = Instant.now();

    protected MembershipEntity() { }

    public MembershipEntity(UUID communityId, UUID userId, String role) {
        this.communityId = communityId;
        this.userId = userId;
        this.role = role;
        this.joinedAt = Instant.now();
    }

    public UUID getCommunityId() { return communityId; }
    public UUID getUserId() { return userId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Instant getJoinedAt() { return joinedAt; }
}
