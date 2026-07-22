package com.autohub.products.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductImageJpaRepository extends JpaRepository<ProductImageEntity, UUID> {

    List<ProductImageEntity> findByProductIdOrderByPositionAsc(UUID productId);

    Optional<ProductImageEntity> findByProductIdAndPosition(UUID productId, int position);

    long countByProductId(UUID productId);
}
