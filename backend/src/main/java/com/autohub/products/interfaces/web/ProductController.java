package com.autohub.products.interfaces.web;

import com.autohub.products.application.ProductQueryService;
import com.autohub.products.interfaces.web.dto.ProductDetailResponse;
import com.autohub.products.interfaces.web.dto.ProductSummaryResponse;
import com.autohub.products.interfaces.web.dto.ReviewFeedItem;
import com.autohub.shared.interfaces.web.ApiResponse;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

/**
 * Public, read-only product catalog API consumed by the MOTORA marketplace front-end.
 * Images are original generated SVGs served straight from the database with long-lived
 * caching (they are immutable per seed).
 */
@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductQueryService service;

    public ProductController(ProductQueryService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<ProductSummaryResponse>> list() {
        return ApiResponse.ok(service.list());
    }

    /* NOTE: mapped before /{slug} resolution ambiguity — literal path wins in Spring. */
    @GetMapping("/reviews/latest")
    public ApiResponse<List<ReviewFeedItem>> latestReviews(@RequestParam(defaultValue = "12") int limit) {
        return ApiResponse.ok(service.latestReviews(limit));
    }

    @GetMapping("/{slug}")
    public ApiResponse<ProductDetailResponse> detail(@PathVariable String slug) {
        return ApiResponse.ok(service.detail(slug));
    }

    @GetMapping(value = "/{slug}/images/{position}", produces = "image/svg+xml")
    public ResponseEntity<byte[]> image(@PathVariable String slug, @PathVariable int position) {
        byte[] body = service.imageSvg(slug, position).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("image/svg+xml"))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(1)).cachePublic())
                .body(body);
    }
}
