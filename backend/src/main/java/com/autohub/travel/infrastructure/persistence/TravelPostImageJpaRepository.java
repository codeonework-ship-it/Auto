package com.autohub.travel.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TravelPostImageJpaRepository extends JpaRepository<TravelPostImageEntity, UUID> {

    List<TravelPostImageEntity> findByTravelPostIdOrderByPositionAsc(UUID travelPostId);

    long countByTravelPostId(UUID travelPostId);

    Optional<TravelPostImageEntity> findByIdAndTravelPostId(UUID id, UUID travelPostId);
}
