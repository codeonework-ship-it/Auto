package com.autohub.adminops.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VehicleVariantRepository extends JpaRepository<VehicleVariantEntity, UUID> {

    List<VehicleVariantEntity> findByModelIdOrderByNameAsc(UUID modelId);

    boolean existsByModelIdAndNameIgnoreCase(UUID modelId, String name);

    boolean existsByModelIdAndNameIgnoreCaseAndIdNot(UUID modelId, String name, UUID id);

    boolean existsByModelId(UUID modelId);
}
