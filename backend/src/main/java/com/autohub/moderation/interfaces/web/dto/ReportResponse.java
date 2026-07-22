package com.autohub.moderation.interfaces.web.dto;

import com.autohub.moderation.infrastructure.persistence.ReportEntity;

import java.time.Instant;

public record ReportResponse(String id, String reporterId, String subjectType, String subjectId,
                             String reasonId, String details, String status, Instant createdAt) {

    public static ReportResponse from(ReportEntity e) {
        return new ReportResponse(e.getId().toString(), e.getReporterId().toString(),
                e.getSubjectType(), e.getSubjectId().toString(),
                e.getReasonId() == null ? null : e.getReasonId().toString(),
                e.getDetails(), e.getStatus(), e.getCreatedAt());
    }
}
