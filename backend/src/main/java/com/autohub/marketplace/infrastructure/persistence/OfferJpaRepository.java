package com.autohub.marketplace.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OfferJpaRepository extends JpaRepository<OfferEntity, UUID> {

    List<OfferEntity> findByListingIdOrderByCreatedAtDesc(UUID listingId);
}
