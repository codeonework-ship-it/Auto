package com.autohub.community.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommunityJpaRepository extends JpaRepository<CommunityEntity, UUID> {

    Optional<CommunityEntity> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<CommunityEntity> findAllByOrderByCreatedAtDesc();
}
