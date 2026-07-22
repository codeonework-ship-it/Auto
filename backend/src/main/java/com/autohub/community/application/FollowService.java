package com.autohub.community.application;

import com.autohub.community.infrastructure.persistence.FollowEntity;
import com.autohub.community.infrastructure.persistence.FollowJpaRepository;
import com.autohub.shared.application.port.CurrentUser;
import com.autohub.shared.domain.exception.ConflictException;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Social follow use cases: follow/unfollow another user (self-follow rejected, duplicates
 * conflict) and list who the caller follows / who follows the caller, with aggregate counts.
 */
@Service
public class FollowService {

    private final FollowJpaRepository follows;
    private final CurrentUser currentUser;

    public FollowService(FollowJpaRepository follows, CurrentUser currentUser) {
        this.follows = follows;
        this.currentUser = currentUser;
    }

    @Transactional
    public FollowEntity follow(UUID targetUserId) {
        UUID followerId = currentUser.requireUserId();
        if (followerId.equals(targetUserId)) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }
        if (follows.existsByFollowerIdAndFollowingId(followerId, targetUserId)) {
            throw new ConflictException("You already follow this user");
        }
        return follows.save(new FollowEntity(UUID.randomUUID(), followerId, targetUserId));
    }

    @Transactional
    public void unfollow(UUID targetUserId) {
        UUID followerId = currentUser.requireUserId();
        FollowEntity edge = follows.findByFollowerIdAndFollowingId(followerId, targetUserId)
                .orElseThrow(() -> new NotFoundException("You do not follow this user"));
        follows.delete(edge);
    }

    @Transactional(readOnly = true)
    public List<FollowEntity> following() {
        return follows.findByFollowerId(currentUser.requireUserId());
    }

    @Transactional(readOnly = true)
    public List<FollowEntity> followers() {
        return follows.findByFollowingId(currentUser.requireUserId());
    }

    public long followingCount() {
        return follows.countByFollowerId(currentUser.requireUserId());
    }

    public long followerCount() {
        return follows.countByFollowingId(currentUser.requireUserId());
    }
}
