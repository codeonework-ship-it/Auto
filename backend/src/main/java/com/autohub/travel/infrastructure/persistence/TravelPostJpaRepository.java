package com.autohub.travel.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TravelPostJpaRepository extends JpaRepository<TravelPostEntity, UUID> {

    Optional<TravelPostEntity> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<TravelPostEntity> findByStatusOrderByPublishedAtDesc(String status);

    List<TravelPostEntity> findByAuthorIdOrderByCreatedAtDesc(UUID authorId);
}
