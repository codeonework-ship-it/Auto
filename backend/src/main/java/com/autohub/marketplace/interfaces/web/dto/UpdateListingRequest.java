package com.autohub.marketplace.interfaces.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateListingRequest(
        @NotBlank @Size(max = 200) String title,
        String descriptionHtml,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal priceAmount,
        @Pattern(regexp = "[A-Z]{3}", message = "currency must be a 3-letter ISO code") String currency,
        String postId,
        String cityId) {
}
