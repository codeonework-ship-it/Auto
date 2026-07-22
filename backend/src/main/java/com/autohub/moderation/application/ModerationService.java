package com.autohub.moderation.application;

import com.autohub.engagement.domain.model.ContentStatus;
import com.autohub.engagement.infrastructure.persistence.CommentEntity;
import com.autohub.engagement.infrastructure.persistence.CommentJpaRepository;
import com.autohub.engagement.infrastructure.persistence.ReviewEntity;
import com.autohub.engagement.infrastructure.persistence.ReviewJpaRepository;
import com.autohub.moderation.infrastructure.persistence.ReportEntity;
import com.autohub.moderation.infrastructure.persistence.ReportJpaRepository;
import com.autohub.moderation.interfaces.web.dto.CreateReportRequest;
import com.autohub.shared.application.port.CurrentUser;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Moderation: user-submitted reports and the moderator queue/actions. Report creation is open
 * to any authenticated user; the queue and hide/remove actions require moderation permissions.
 */
@Service
public class ModerationService {

    private static final Set<String> REPORT_STATES = Set.of("OPEN", "REVIEWING", "RESOLVED", "DISMISSED");

    private final ReportJpaRepository reports;
    private final CommentJpaRepository comments;
    private final ReviewJpaRepository reviews;
    private final CurrentUser currentUser;

    public ModerationService(ReportJpaRepository reports, CommentJpaRepository comments,
                             ReviewJpaRepository reviews, CurrentUser currentUser) {
        this.reports = reports;
        this.comments = comments;
        this.reviews = reviews;
        this.currentUser = currentUser;
    }

    // ---- reports ----

    @Transactional
    public ReportEntity createReport(CreateReportRequest req) {
        UUID subjectId = parseUuid(req.subjectId(), "subjectId");
        UUID reasonId = req.reasonId() == null || req.reasonId().isBlank()
                ? null : parseUuid(req.reasonId(), "reasonId");
        ReportEntity report = new ReportEntity(UUID.randomUUID(), currentUser.requireUserId(),
                req.subjectType().toUpperCase(Locale.ROOT), subjectId, reasonId, req.details(), "OPEN");
        return reports.save(report);
    }

    @Transactional(readOnly = true)
    public List<ReportEntity> listReports(String status) {
        if (status == null || status.isBlank()) {
            return reports.findAllByOrderByCreatedAtDesc();
        }
        return reports.findByStatusOrderByCreatedAtAsc(status.toUpperCase(Locale.ROOT));
    }

    @Transactional
    public ReportEntity setReportStatus(UUID id, String status) {
        String normalized = status.toUpperCase(Locale.ROOT);
        if (!REPORT_STATES.contains(normalized)) {
            throw new IllegalArgumentException("Invalid report status: " + status);
        }
        ReportEntity report = reports.findById(id)
                .orElseThrow(() -> new NotFoundException("Report not found: " + id));
        report.setStatus(normalized);
        return reports.save(report);
    }

    // ---- content actions (hide / restore) ----

    @Transactional
    public CommentEntity setCommentStatus(UUID id, String status) {
        CommentEntity comment = comments.findById(id)
                .orElseThrow(() -> new NotFoundException("Comment not found: " + id));
        comment.setStatus(contentStatus(status));
        return comments.save(comment);
    }

    @Transactional
    public ReviewEntity setReviewStatus(UUID id, String status) {
        ReviewEntity review = reviews.findById(id)
                .orElseThrow(() -> new NotFoundException("Review not found: " + id));
        review.setStatus(contentStatus(status));
        return reviews.save(review);
    }

    private String contentStatus(String status) {
        try {
            return ContentStatus.valueOf(status.toUpperCase(Locale.ROOT)).name();
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid content status: " + status
                    + " (expected VISIBLE|HIDDEN|FLAGGED)");
        }
    }

    private UUID parseUuid(String value, String field) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid " + field + ": " + value);
        }
    }
}
