package com.autohub.kyc.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface KycProfileJpaRepository extends JpaRepository<KycProfileEntity, UUID> {

    List<KycProfileEntity> findByUserId(UUID userId);

    boolean existsByUserIdAndKycType(UUID userId, String kycType);

    List<KycProfileEntity> findByStatusOrderByCreatedAtAsc(String status);

    List<KycProfileEntity> findAllByOrderByCreatedAtDesc();
}
