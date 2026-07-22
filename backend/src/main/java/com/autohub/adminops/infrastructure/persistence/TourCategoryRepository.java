package com.autohub.adminops.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TourCategoryRepository extends JpaRepository<TourCategoryEntity, UUID> {
}
