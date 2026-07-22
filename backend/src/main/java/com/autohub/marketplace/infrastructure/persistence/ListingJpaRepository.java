package com.autohub.marketplace.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ListingJpaRepository extends JpaRepository<ListingEntity, UUID> {

    List<ListingEntity> findByStatusOrderByUpdatedAtDesc(String status);

    List<ListingEntity> findBySellerIdOrderByUpdatedAtDesc(UUID sellerId);
}
