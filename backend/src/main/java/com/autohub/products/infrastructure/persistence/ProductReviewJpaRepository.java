package com.autohub.products.infrastructure.persistence;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductReviewJpaRepository extends JpaRepository<ProductReviewEntity, UUID> {

    List<ProductReviewEntity> findByProductIdOrderByPositionAsc(UUID productId);

    List<ProductReviewEntity> findAllByOrderByHelpfulDesc(Pageable pageable);
}
