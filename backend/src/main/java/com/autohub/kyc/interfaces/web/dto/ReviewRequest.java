package com.autohub.kyc.interfaces.web.dto;

import jakarta.validation.constraints.Size;

/** Reviewer decision payload. {@code notes} carries the rejection reason (optional on approve). */
public record ReviewRequest(@Size(max = 2000) String notes) {
}
