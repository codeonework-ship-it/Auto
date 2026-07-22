package com.autohub.engagement.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewTagLinkJpaRepository extends JpaRepository<ReviewTagLinkEntity, ReviewTagLinkId> {

    List<ReviewTagLinkEntity> findByReviewId(UUID reviewId);

    void deleteByReviewId(UUID reviewId);
}
