package com.autohub.engagement.interfaces.web.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateReviewRequest(
        @Min(1) @Max(5) int rating,
        @Size(max = 4000) String body,
        List<String> tagIds) {
}
