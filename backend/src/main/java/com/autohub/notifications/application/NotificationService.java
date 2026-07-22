package com.autohub.notifications.application;

import com.autohub.notifications.infrastructure.persistence.NotificationEntity;
import com.autohub.notifications.infrastructure.persistence.NotificationJpaRepository;
import com.autohub.shared.application.port.CurrentUser;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Notification use cases: create a notification for a recipient and let the recipient list,
 * count, and mark their own notifications read. Ownership is enforced — a caller only ever
 * sees or mutates notifications addressed to them.
 *
 * <p>In non-local environments a {@code @KafkaListener} would auto-create notifications by
 * subscribing to domain-event topics ({@code catalog.post.published},
 * {@code marketplace.listing.created}, {@code engagement.review.added}). On the {@code local}
 * profile Kafka is disabled, so the admin POST endpoint (see {@code NotificationController})
 * is the create path used for testing.
 */
@Service
public class NotificationService {

    private final NotificationJpaRepository notifications;
    private final CurrentUser currentUser;

    public NotificationService(NotificationJpaRepository notifications, CurrentUser currentUser) {
        this.notifications = notifications;
        this.currentUser = currentUser;
    }

    // ---- commands ----

    @Transactional
    public NotificationEntity create(UUID recipientId, String type, String title, String body,
                                     String entityType, UUID entityId) {
        NotificationEntity notification = new NotificationEntity(
                UUID.randomUUID(), recipientId, type, title, body, entityType, entityId);
        return notifications.save(notification);
    }

    @Transactional
    public NotificationEntity markRead(UUID id) {
        UUID recipientId = currentUser.requireUserId();
        NotificationEntity notification = notifications.findByIdAndRecipientId(id, recipientId)
                .orElseThrow(() -> new NotFoundException("Notification not found: " + id));
        notification.markRead();
        return notifications.save(notification);
    }

    @Transactional
    public void markAllRead() {
        UUID recipientId = currentUser.requireUserId();
        List<NotificationEntity> unread =
                notifications.findByRecipientIdAndReadFalseOrderByCreatedAtDesc(recipientId);
        unread.forEach(NotificationEntity::markRead);
        notifications.saveAll(unread);
    }

    // ---- queries ----

    @Transactional(readOnly = true)
    public List<NotificationEntity> listMine() {
        return notifications.findByRecipientIdOrderByCreatedAtDesc(currentUser.requireUserId());
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        return notifications.countByRecipientIdAndReadFalse(currentUser.requireUserId());
    }
}
