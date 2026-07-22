package com.autohub.products.interfaces.web.dto;

import com.autohub.products.infrastructure.persistence.ProductEntity;
import com.autohub.products.infrastructure.persistence.ProductReviewEntity;

/** A review joined with its product identity, for cross-catalog review feeds. */
public record ReviewFeedItem(String author, double rating, String title, String content,
                             String date, boolean verified, int helpful,
                             String productId, String productBrand, String productModel) {

    public static ReviewFeedItem from(ProductReviewEntity r, ProductEntity p) {
        return new ReviewFeedItem(r.getAuthor(), r.getRating(), r.getTitle(), r.getContent(),
                r.getReviewDate(), r.isVerified(), r.getHelpful(),
                p.getSlug(), p.getBrand(), p.getModel());
    }
}
