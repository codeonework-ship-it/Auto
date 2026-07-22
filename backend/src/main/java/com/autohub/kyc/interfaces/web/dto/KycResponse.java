package com.autohub.kyc.interfaces.web.dto;

import com.autohub.kyc.infrastructure.persistence.KycProfileEntity;

import java.time.Instant;

public record KycResponse(String id, String userId, String kycType, String legalName,
                          String documentType, String documentNumber, String phone, String addressLine,
                          String city, String country, String status, String reviewerId,
                          String reviewNotes, Instant submittedAt, Instant reviewedAt,
                          Instant createdAt) {

    public static KycResponse from(KycProfileEntity e) {
        return new KycResponse(
                e.getId().toString(), e.getUserId().toString(), e.getKycType(), e.getLegalName(),
                e.getDocumentType(), e.getDocumentNumber(), e.getPhone(), e.getAddressLine(),
                e.getCity(), e.getCountry(), e.getStatus(), str(e.getReviewerId()),
                e.getReviewNotes(), e.getSubmittedAt(), e.getReviewedAt(), e.getCreatedAt());
    }

    private static String str(Object o) {
        return o == null ? null : o.toString();
    }
}
