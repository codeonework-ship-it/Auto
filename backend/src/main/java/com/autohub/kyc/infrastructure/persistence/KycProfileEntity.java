package com.autohub.kyc.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;
import java.util.UUID;

/**
 * Persistence model for a buyer/seller KYC profile (table {@code kyc_profiles}).
 *
 * <p>Only text identity fields are stored; no document files or uploads are held here — per the
 * project safety rules KYC accepts text fields only. A user may have at most one profile per
 * {@code (user_id, kyc_type)} pair (enforced by the unique constraint and the service).
 */
@Entity
@Table(name = "kyc_profiles",
        uniqueConstraints = @UniqueConstraint(name = "uk_kyc_profiles_user_type",
                columnNames = {"user_id", "kyc_type"}))
public class KycProfileEntity {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "kyc_type", nullable = false)
    private String kycType;              // BUYER | SELLER

    @Column(name = "legal_name", nullable = false)
    private String legalName;

    @Column(name = "document_type", nullable = false)
    private String documentType;         // PASSPORT | DRIVERS_LICENSE | NATIONAL_ID | GST

    @Column(name = "document_number", nullable = false)
    private String documentNumber;

    @Column(name = "phone")
    private String phone;

    @Column(name = "address_line", columnDefinition = "text")
    private String addressLine;

    @Column(name = "city")
    private String city;

    @Column(name = "country")
    private String country;

    @Column(name = "status", nullable = false)
    private String status;               // DRAFT | SUBMITTED | UNDER_REVIEW | APPROVED | REJECTED

    @Column(name = "reviewer_id")
    private UUID reviewerId;

    @Column(name = "review_notes", columnDefinition = "text")
    private String reviewNotes;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected KycProfileEntity() { }

    public KycProfileEntity(UUID id, UUID userId, String kycType, String legalName, String documentType,
                            String documentNumber, String phone, String addressLine, String city,
                            String country) {
        this.id = id;
        this.userId = userId;
        this.kycType = kycType;
        this.legalName = legalName;
        this.documentType = documentType;
        this.documentNumber = documentNumber;
        this.phone = phone;
        this.addressLine = addressLine;
        this.city = city;
        this.country = country;
        this.status = "DRAFT";
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getKycType() { return kycType; }
    public String getLegalName() { return legalName; }
    public void setLegalName(String legalName) { this.legalName = legalName; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddressLine() { return addressLine; }
    public void setAddressLine(String addressLine) { this.addressLine = addressLine; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public UUID getReviewerId() { return reviewerId; }
    public void setReviewerId(UUID reviewerId) { this.reviewerId = reviewerId; }
    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
    public Instant getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(Instant submittedAt) { this.submittedAt = submittedAt; }
    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
    public Instant getCreatedAt() { return createdAt; }
}
