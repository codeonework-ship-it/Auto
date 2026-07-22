package com.autohub.catalog.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PostJpaRepository extends JpaRepository<PostEntity, UUID> {

    Optional<PostEntity> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<PostEntity> findByStatusOrderByPublishedAtDesc(String status);

    List<PostEntity> findByStatusAndKindOrderByPublishedAtDesc(String status, String kind);

    List<PostEntity> findByAuthorIdOrderByUpdatedAtDesc(UUID authorId);
}
