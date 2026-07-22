package com.autohub.moderation.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateReportRequest(
        @NotBlank @Pattern(regexp = "POST|COMMENT|REVIEW|LISTING|USER") String subjectType,
        @NotBlank String subjectId,
        String reasonId,
        @Size(max = 500) String details) {
}
