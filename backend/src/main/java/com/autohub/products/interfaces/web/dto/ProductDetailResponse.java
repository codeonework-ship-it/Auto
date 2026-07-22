package com.autohub.products.interfaces.web.dto;

import com.autohub.products.infrastructure.persistence.ProductEntity;
import com.autohub.products.infrastructure.persistence.ProductReviewEntity;
import com.autohub.products.infrastructure.persistence.ProductSpecRowEntity;
import com.autohub.products.infrastructure.persistence.ProductVariantEntity;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.autohub.products.interfaces.web.dto.ProductSummaryResponse.split;

/** Full product payload: summary + colours, variants, grouped specs, pros/cons, reviews. */
public record ProductDetailResponse(
        ProductSummaryResponse summary,
        List<String> colors,
        List<VariantDto> variants,
        Map<String, Map<String, String>> specs,
        List<String> pros,
        List<String> cons,
        List<ReviewDto> reviews,
        List<String> imageLabels) {

    public record VariantDto(String name, BigDecimal price, String power, String mileage) {
        public static VariantDto from(ProductVariantEntity v) {
            return new VariantDto(v.getName(), v.getPrice(), v.getPower(), v.getMileage());
        }
    }

    public record ReviewDto(String author, double rating, String title, String content, String date,
                            boolean verified, String ownership, String variant,
                            List<String> pros, List<String> cons, int helpful) {
        public static ReviewDto from(ProductReviewEntity r) {
            return new ReviewDto(r.getAuthor(), r.getRating(), r.getTitle(), r.getContent(), r.getReviewDate(),
                    r.isVerified(), r.getOwnership(), r.getVariantName(),
                    split(r.getPros()), split(r.getCons()), r.getHelpful());
        }
    }

    public static ProductDetailResponse from(ProductEntity e, int imageCount, List<String> imageLabels,
                                             List<ProductVariantEntity> variants,
                                             List<ProductSpecRowEntity> specRows,
                                             List<ProductReviewEntity> reviews) {
        Map<String, Map<String, String>> specs = new LinkedHashMap<>();
        for (ProductSpecRowEntity row : specRows) {
            specs.computeIfAbsent(row.getGrp(), g -> new LinkedHashMap<>()).put(row.getK(), row.getV());
        }
        return new ProductDetailResponse(
                ProductSummaryResponse.from(e, imageCount),
                split(e.getColors()),
                variants.stream().map(VariantDto::from).toList(),
                specs,
                split(e.getPros()),
                split(e.getCons()),
                reviews.stream().map(ReviewDto::from).toList(),
                imageLabels);
    }
}
