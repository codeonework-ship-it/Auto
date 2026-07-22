package com.autohub.travel.interfaces.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/** Offer a guided tour. {@code descriptionHtml} is sanitized server-side. Category optional. */
public record CreateTourRequest(
        @NotBlank @Size(max = 200) String title,
        String descriptionHtml,
        String categoryId,
        @Size(max = 200) String destination,
        @Positive Integer durationDays,
        @PositiveOrZero BigDecimal priceAmount,
        @Pattern(regexp = "[A-Za-z]{3}", message = "currency must be a 3-letter code") String currency) {
}
