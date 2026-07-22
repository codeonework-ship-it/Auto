package com.autohub.moderation.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

/** Persistence model for a moderation report (table {@code reports}). */
@Entity
@Table(name = "reports")
public class ReportEntity {

    @Id
    private UUID id;

    @Column(name = "reporter_id", nullable = false)
    private UUID reporterId;

    @Column(name = "subject_type", nullable = false)
    private String subjectType;         // POST | COMMENT | REVIEW | LISTING | USER

    @Column(name = "subject_id", nullable = false)
    private UUID subjectId;

    @Column(name = "reason_id")
    private UUID reasonId;

    @Column
    private String details;

    @Column(nullable = false)
    private String status;              // OPEN | REVIEWING | RESOLVED | DISMISSED

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected ReportEntity() { }

    public ReportEntity(UUID id, UUID reporterId, String subjectType, UUID subjectId,
                        UUID reasonId, String details, String status) {
        this.id = id;
        this.reporterId = reporterId;
        this.subjectType = subjectType;
        this.subjectId = subjectId;
        this.reasonId = reasonId;
        this.details = details;
        this.status = status;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getReporterId() { return reporterId; }
    public String getSubjectType() { return subjectType; }
    public UUID getSubjectId() { return subjectId; }
    public UUID getReasonId() { return reasonId; }
    public String getDetails() { return details; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
