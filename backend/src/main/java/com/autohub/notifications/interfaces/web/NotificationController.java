package com.autohub.notifications.interfaces.web;

import com.autohub.notifications.application.NotificationService;
import com.autohub.notifications.infrastructure.persistence.NotificationEntity;
import com.autohub.notifications.interfaces.web.dto.CreateNotificationRequest;
import com.autohub.notifications.interfaces.web.dto.NotificationResponse;
import com.autohub.shared.interfaces.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Notifications web adapter. Every route under {@code /api/v1/notifications} is authenticated:
 * reads/mutations act on the caller's own notifications (ownership enforced in the service), and
 * the create endpoint is additionally gated by the {@code user:manage} permission.
 *
 * <p>In non-local environments a {@code @KafkaListener} would auto-create notifications from
 * domain-event topics ({@code catalog.post.published}, {@code marketplace.listing.created},
 * {@code engagement.review.added}). On the {@code local} profile Kafka is disabled, so the admin
 * POST endpoint below is the create path used for testing.
 */
@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // ---- reads ----

    @GetMapping
    public ApiResponse<List<NotificationResponse>> list() {
        return ApiResponse.ok(notificationService.listMine().stream()
                .map(NotificationResponse::from).toList());
    }

    @GetMapping("/unread-count")
    public ApiResponse<Map<String, Long>> unreadCount() {
        return ApiResponse.ok(Map.of("count", notificationService.unreadCount()));
    }

    // ---- writes ----

    @PatchMapping("/{id}/read")
    public ApiResponse<NotificationResponse> markRead(@PathVariable UUID id) {
        return ApiResponse.ok(NotificationResponse.from(notificationService.markRead(id)));
    }

    @PatchMapping("/read-all")
    public ApiResponse<Void> markAllRead() {
        notificationService.markAllRead();
        return ApiResponse.ok(null);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('user:manage')")
    public ResponseEntity<ApiResponse<NotificationResponse>> create(
            @Valid @RequestBody CreateNotificationRequest request) {
        NotificationEntity notification = notificationService.create(
                parseUuid(request.recipientId()), request.type(), request.title(), request.body(),
                request.entityType(), parseUuid(request.entityId()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(NotificationResponse.from(notification)));
    }

    private static UUID parseUuid(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID: " + value);
        }
    }
}
