package com.autohub.engagement.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewJpaRepository extends JpaRepository<ReviewEntity, UUID> {

    List<ReviewEntity> findByPostIdAndStatusOrderByCreatedAtDesc(UUID postId, String status);

    boolean existsByPostIdAndAuthorId(UUID postId, UUID authorId);
}
