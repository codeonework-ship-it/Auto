package com.autohub.catalog.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePostRequest(
        @NotBlank @Size(max = 200) String title,
        String bodyHtml,
        String makeId,
        String modelId,
        String variantId) {
}
