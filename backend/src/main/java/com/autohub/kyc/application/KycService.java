package com.autohub.kyc.application;

import com.autohub.kyc.domain.model.KycStatus;
import com.autohub.kyc.infrastructure.persistence.KycProfileEntity;
import com.autohub.kyc.infrastructure.persistence.KycProfileJpaRepository;
import com.autohub.kyc.interfaces.web.dto.SubmitKycRequest;
import com.autohub.shared.application.port.CurrentUser;
import com.autohub.shared.domain.exception.ConflictException;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * KYC use cases: buyers/sellers submit and update their own identity profiles; reviewers list
 * and approve/reject them. Text fields only are captured — no document files/uploads are stored
 * or accepted, per the project safety rules. A user may hold at most one profile per KYC type.
 */
@Service
public class KycService {

    /** Statuses in which the owner may still edit their submission. */
    private static final Set<String> EDITABLE_STATUSES = Set.of(
            KycStatus.DRAFT.name(), KycStatus.SUBMITTED.name(), KycStatus.REJECTED.name());

    private final KycProfileJpaRepository profiles;
    private final CurrentUser currentUser;

    public KycService(KycProfileJpaRepository profiles, CurrentUser currentUser) {
        this.profiles = profiles;
        this.currentUser = currentUser;
    }

    // ---- commands (owner) ----

    @Transactional
    public KycProfileEntity submit(SubmitKycRequest req) {
        UUID userId = currentUser.requireUserId();
        String kycType = req.kycType().toUpperCase(Locale.ROOT);
        if (profiles.existsByUserIdAndKycType(userId, kycType)) {
            throw new ConflictException("A " + kycType + " KYC profile already exists for this user");
        }
        KycProfileEntity profile = new KycProfileEntity(
                UUID.randomUUID(), userId, kycType, req.legalName().trim(),
                req.documentType(), req.documentNumber().trim(), trimToNull(req.phone()),
                trimToNull(req.addressLine()), trimToNull(req.city()), trimToNull(req.country()));
        profile.setStatus(KycStatus.SUBMITTED.name());
        profile.setSubmittedAt(Instant.now());
        return profiles.save(profile);
    }

    @Transactional
    public KycProfileEntity update(UUID id, SubmitKycRequest req) {
        KycProfileEntity profile = require(id);
        assertOwner(profile);
        if (!EDITABLE_STATUSES.contains(profile.getStatus())) {
            throw new ConflictException(
                    "This KYC profile can no longer be edited (status " + profile.getStatus() + ")");
        }
        profile.setLegalName(req.legalName().trim());
        profile.setDocumentType(req.documentType());
        profile.setDocumentNumber(req.documentNumber().trim());
        profile.setPhone(trimToNull(req.phone()));
        profile.setAddressLine(trimToNull(req.addressLine()));
        profile.setCity(trimToNull(req.city()));
        profile.setCountry(trimToNull(req.country()));
        profile.setStatus(KycStatus.SUBMITTED.name());
        profile.setSubmittedAt(Instant.now());
        // Clear any prior reviewer decision now that it is resubmitted.
        profile.setReviewerId(null);
        profile.setReviewNotes(null);
        profile.setReviewedAt(null);
        return profiles.save(profile);
    }

    // ---- commands (reviewer) ----

    @Transactional
    public KycProfileEntity approve(UUID id) {
        KycProfileEntity profile = require(id);
        profile.setStatus(KycStatus.APPROVED.name());
        profile.setReviewerId(currentUser.requireUserId());
        profile.setReviewedAt(Instant.now());
        return profiles.save(profile);
    }

    @Transactional
    public KycProfileEntity reject(UUID id, String notes) {
        KycProfileEntity profile = require(id);
        profile.setStatus(KycStatus.REJECTED.name());
        profile.setReviewNotes(notes);
        profile.setReviewerId(currentUser.requireUserId());
        profile.setReviewedAt(Instant.now());
        return profiles.save(profile);
    }

    // ---- queries ----

    @Transactional(readOnly = true)
    public List<KycProfileEntity> listMine() {
        return profiles.findByUserId(currentUser.requireUserId());
    }

    @Transactional(readOnly = true)
    public List<KycProfileEntity> listForReview(String status) {
        if (status == null || status.isBlank()) {
            return profiles.findAllByOrderByCreatedAtDesc();
        }
        return profiles.findByStatusOrderByCreatedAtAsc(status.toUpperCase(Locale.ROOT));
    }

    @Transactional(readOnly = true)
    public KycProfileEntity get(UUID id) {
        return require(id);
    }

    // ---- helpers ----

    private KycProfileEntity require(UUID id) {
        return profiles.findById(id)
                .orElseThrow(() -> new NotFoundException("KYC profile not found: " + id));
    }

    private void assertOwner(KycProfileEntity profile) {
        if (!profile.getUserId().equals(currentUser.requireUserId())) {
            throw new AccessDeniedException("You may only modify your own KYC profile");
        }
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
