package com.autohub.catalog.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Create a car/bike post. {@code bodyHtml} is sanitized server-side. Make/model/variant optional. */
public record CreatePostRequest(
        @NotBlank @Pattern(regexp = "CAR|BIKE", message = "kind must be CAR or BIKE") String kind,
        @NotBlank @Size(max = 200) String title,
        String bodyHtml,
        String makeId,
        String modelId,
        String variantId) {
}
