package com.autohub.catalog.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PostImageJpaRepository extends JpaRepository<PostImageEntity, UUID> {

    List<PostImageEntity> findByPostIdOrderByPositionAsc(UUID postId);

    long countByPostId(UUID postId);

    Optional<PostImageEntity> findByIdAndPostId(UUID id, UUID postId);
}
