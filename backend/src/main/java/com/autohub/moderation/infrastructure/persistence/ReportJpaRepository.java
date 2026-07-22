package com.autohub.moderation.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReportJpaRepository extends JpaRepository<ReportEntity, UUID> {

    List<ReportEntity> findByStatusOrderByCreatedAtAsc(String status);

    List<ReportEntity> findAllByOrderByCreatedAtDesc();
}
