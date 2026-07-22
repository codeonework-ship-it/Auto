package com.autohub.adminops.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VehicleModelRepository extends JpaRepository<VehicleModelEntity, UUID> {

    List<VehicleModelEntity> findByMakeIdOrderByNameAsc(UUID makeId);

    boolean existsByMakeIdAndNameIgnoreCase(UUID makeId, String name);

    boolean existsByMakeIdAndNameIgnoreCaseAndIdNot(UUID makeId, String name, UUID id);

    boolean existsByMakeId(UUID makeId);
}
