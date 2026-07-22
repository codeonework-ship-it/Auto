package com.autohub.community.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FollowJpaRepository extends JpaRepository<FollowEntity, UUID> {

    boolean existsByFollowerIdAndFollowingId(UUID followerId, UUID followingId);

    List<FollowEntity> findByFollowerId(UUID followerId);

    List<FollowEntity> findByFollowingId(UUID followingId);

    long countByFollowingId(UUID followingId);

    long countByFollowerId(UUID followerId);

    Optional<FollowEntity> findByFollowerIdAndFollowingId(UUID followerId, UUID followingId);
}
