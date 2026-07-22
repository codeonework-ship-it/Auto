package com.autohub.products.application;

import com.autohub.products.infrastructure.persistence.ProductEntity;
import com.autohub.products.infrastructure.persistence.ProductImageEntity;
import com.autohub.products.infrastructure.persistence.ProductImageJpaRepository;
import com.autohub.products.infrastructure.persistence.ProductJpaRepository;
import com.autohub.products.infrastructure.persistence.ProductReviewJpaRepository;
import com.autohub.products.infrastructure.persistence.ProductSpecRowJpaRepository;
import com.autohub.products.infrastructure.persistence.ProductVariantJpaRepository;
import com.autohub.products.interfaces.web.dto.ProductDetailResponse;
import com.autohub.products.interfaces.web.dto.ProductSummaryResponse;
import com.autohub.products.interfaces.web.dto.ReviewFeedItem;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Read-side of the product catalog. List responses carry every scalar field the
 * marketplace UI needs for cards, filters, rankings and comparisons; the detail
 * response adds grouped specs, variants, colours and reviews.
 */
@Service
public class ProductQueryService {

    private final ProductJpaRepository products;
    private final ProductVariantJpaRepository variants;
    private final ProductSpecRowJpaRepository specs;
    private final ProductImageJpaRepository images;
    private final ProductReviewJpaRepository reviews;

    public ProductQueryService(ProductJpaRepository products, ProductVariantJpaRepository variants,
                               ProductSpecRowJpaRepository specs, ProductImageJpaRepository images,
                               ProductReviewJpaRepository reviews) {
        this.products = products;
        this.variants = variants;
        this.specs = specs;
        this.images = images;
        this.reviews = reviews;
    }

    @Transactional(readOnly = true)
    public List<ProductSummaryResponse> list() {
        // One pass over images to build counts — avoids N+1 for the 100-product list.
        Map<UUID, Integer> imageCounts = new HashMap<>();
        for (ProductImageEntity img : images.findAll()) {
            imageCounts.merge(img.getProductId(), 1, Integer::sum);
        }
        return products.findAll().stream()
                .map(p -> ProductSummaryResponse.from(p, imageCounts.getOrDefault(p.getId(), 0)))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductDetailResponse detail(String slug) {
        ProductEntity p = products.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Product not found: " + slug));
        List<ProductImageEntity> imgs = images.findByProductIdOrderByPositionAsc(p.getId());
        return ProductDetailResponse.from(
                p, imgs.size(), imgs.stream().map(ProductImageEntity::getLabel).toList(),
                variants.findByProductIdOrderByPositionAsc(p.getId()),
                specs.findByProductIdOrderByPositionAsc(p.getId()),
                reviews.findByProductIdOrderByPositionAsc(p.getId()));
    }

    @Transactional(readOnly = true)
    public String imageSvg(String slug, int position) {
        ProductEntity p = products.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Product not found: " + slug));
        return images.findByProductIdAndPosition(p.getId(), position)
                .orElseThrow(() -> new NotFoundException("Image " + position + " not found for " + slug))
                .getSvg();
    }

    @Transactional(readOnly = true)
    public List<ReviewFeedItem> latestReviews(int limit) {
        return reviews.findAllByOrderByHelpfulDesc(PageRequest.of(0, Math.min(Math.max(limit, 1), 50)))
                .stream()
                .map(r -> products.findById(r.getProductId())
                        .map(p -> ReviewFeedItem.from(r, p)).orElse(null))
                .filter(java.util.Objects::nonNull)
                .toList();
    }
}
