package com.autohub.engagement.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommentJpaRepository extends JpaRepository<CommentEntity, UUID> {

    List<CommentEntity> findByPostIdAndStatusOrderByCreatedAtAsc(UUID postId, String status);
}
