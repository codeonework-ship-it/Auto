package com.autohub.community.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;
import java.util.UUID;

/** Persistence model for a social follow edge (table {@code follows}); one per follower→following. */
@Entity
@Table(name = "follows", uniqueConstraints = @UniqueConstraint(columnNames = {"follower_id", "following_id"}))
public class FollowEntity {

    @Id
    private UUID id;

    @Column(name = "follower_id", nullable = false)
    private UUID followerId;

    @Column(name = "following_id", nullable = false)
    private UUID followingId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected FollowEntity() { }

    public FollowEntity(UUID id, UUID followerId, UUID followingId) {
        this.id = id;
        this.followerId = followerId;
        this.followingId = followingId;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getFollowerId() { return followerId; }
    public UUID getFollowingId() { return followingId; }
    public Instant getCreatedAt() { return createdAt; }
}
