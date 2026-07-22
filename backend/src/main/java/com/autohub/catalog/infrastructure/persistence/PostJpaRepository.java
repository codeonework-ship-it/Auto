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

    // Feed filters: narrow published posts by make (optionally within a kind) and by make+model.
    List<PostEntity> findByStatusAndMakeIdOrderByPublishedAtDesc(String status, UUID makeId);

    List<PostEntity> findByStatusAndKindAndMakeIdOrderByPublishedAtDesc(String status, String kind, UUID makeId);

    List<PostEntity> findByStatusAndMakeIdAndModelIdOrderByPublishedAtDesc(String status, UUID makeId, UUID modelId);

    List<PostEntity> findByStatusAndKindAndMakeIdAndModelIdOrderByPublishedAtDesc(
            String status, String kind, UUID makeId, UUID modelId);

    List<PostEntity> findByAuthorIdOrderByUpdatedAtDesc(UUID authorId);
}
