package com.autohub.travel.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateTravelPostRequest(
        @NotBlank @Size(max = 200) String title,
        String bodyHtml,
        @Size(max = 200) String location) {
}
