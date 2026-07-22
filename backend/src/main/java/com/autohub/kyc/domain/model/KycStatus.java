package com.autohub.kyc.domain.model;

/** Lifecycle of a KYC profile from draft through reviewer decision. */
public enum KycStatus {
    DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED
}
