package com.autohub.products.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductSpecRowJpaRepository extends JpaRepository<ProductSpecRowEntity, UUID> {

    List<ProductSpecRowEntity> findByProductIdOrderByPositionAsc(UUID productId);
}
