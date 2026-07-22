package com.autohub.notifications.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationJpaRepository extends JpaRepository<NotificationEntity, UUID> {

    List<NotificationEntity> findByRecipientIdOrderByCreatedAtDesc(UUID recipientId);

    List<NotificationEntity> findByRecipientIdAndReadFalseOrderByCreatedAtDesc(UUID recipientId);

    long countByRecipientIdAndReadFalse(UUID recipientId);

    Optional<NotificationEntity> findByIdAndRecipientId(UUID id, UUID recipientId);
}
