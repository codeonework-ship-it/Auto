package com.autohub.kyc.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Submit or update a KYC profile. Text fields only — no document files/uploads are accepted
 * (per project safety rules). {@code documentType} is constrained to a small allowed set.
 */
public record SubmitKycRequest(
        @NotBlank @Pattern(regexp = "BUYER|SELLER", message = "kycType must be BUYER or SELLER")
        String kycType,
        @NotBlank @Size(max = 200) String legalName,
        @NotBlank @Pattern(regexp = "PASSPORT|DRIVERS_LICENSE|NATIONAL_ID|GST",
                message = "documentType must be one of PASSPORT, DRIVERS_LICENSE, NATIONAL_ID, GST")
        String documentType,
        @NotBlank @Size(max = 100) String documentNumber,
        @Size(max = 40) String phone,
        @Size(max = 300) String addressLine,
        @Size(max = 120) String city,
        @Size(max = 120) String country) {
}
