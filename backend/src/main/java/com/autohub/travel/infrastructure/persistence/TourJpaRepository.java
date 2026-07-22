package com.autohub.travel.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TourJpaRepository extends JpaRepository<TourEntity, UUID> {

    List<TourEntity> findAllByOrderByCreatedAtDesc();

    List<TourEntity> findByGuideIdOrderByCreatedAtDesc(UUID guideId);
}
