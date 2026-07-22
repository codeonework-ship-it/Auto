package com.autohub.products.interfaces.web.dto;

import com.autohub.products.infrastructure.persistence.ProductEntity;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * List/compare/filter projection of a product. Field names deliberately mirror the
 * MOTORA front-end contract ({@code id} carries the slug; {@code type} is lowercase).
 */
public record ProductSummaryResponse(
        String id, String type, String brand, String model, String category,
        BigDecimal price, int searches, double rating, int reviewCount, String availability,
        String fuel, String transmission, String drivetrain, Integer seating,
        String power, String torque, String mileage, Integer safety, Boolean adas, Boolean sunroof,
        String kerb, String seatHeight, String abs, String cooling, String chargeTime,
        List<String> tags, String highlight, int hue, int imageCount) {

    public static List<String> split(String piped) {
        if (piped == null || piped.isBlank()) return List.of();
        return Arrays.stream(piped.split("\\|")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    public static ProductSummaryResponse from(ProductEntity e, int imageCount) {
        return new ProductSummaryResponse(
                e.getSlug(), e.getType().toLowerCase(Locale.ROOT), e.getBrand(), e.getModel(), e.getCategory(),
                e.getPrice(), e.getSearches(), e.getRating(), e.getReviewCount(), e.getAvailability(),
                e.getFuel(), e.getTransmission(), e.getDrivetrain(), e.getSeating(),
                e.getPower(), e.getTorque(), e.getMileage(), e.getSafety(), e.getAdas(), e.getSunroof(),
                e.getKerb(), e.getSeatHeight(), e.getAbsType(), e.getCooling(), e.getChargeTime(),
                split(e.getTags()), e.getHighlight(), e.getHue(), imageCount);
    }
}
