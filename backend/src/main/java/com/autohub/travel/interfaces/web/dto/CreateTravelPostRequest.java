package com.autohub.travel.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Create a travel blog post. {@code bodyHtml} is sanitized server-side. Location optional. */
public record CreateTravelPostRequest(
        @NotBlank @Size(max = 200) String title,
        String bodyHtml,
        @Size(max = 200) String location) {
}
