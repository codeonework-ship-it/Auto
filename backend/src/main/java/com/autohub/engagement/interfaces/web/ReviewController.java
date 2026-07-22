package com.autohub.engagement.interfaces.web;

import com.autohub.engagement.application.ReviewService;
import com.autohub.engagement.interfaces.web.dto.CreateReviewRequest;
import com.autohub.engagement.interfaces.web.dto.ReviewResponse;
import com.autohub.shared.interfaces.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/** Reviews. Reads are public; writing a review requires {@code review:create} (MEMBER+). */
@RestController
@RequestMapping("/api/v1")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/posts/{postId}/reviews")
    public ApiResponse<List<ReviewResponse>> list(@PathVariable UUID postId) {
        return ApiResponse.ok(reviewService.listVisible(postId).stream()
                .map(r -> ReviewResponse.from(r, reviewService.tagIds(r.getId())))
                .toList());
    }

    @PostMapping("/posts/{postId}/reviews")
    @PreAuthorize("hasAuthority('review:create')")
    public ResponseEntity<ApiResponse<ReviewResponse>> add(@PathVariable UUID postId,
                                                           @Valid @RequestBody CreateReviewRequest request) {
        var saved = reviewService.add(postId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(ReviewResponse.from(saved, reviewService.tagIds(saved.getId()))));
    }

    @PutMapping("/reviews/{id}")
    @PreAuthorize("hasAuthority('review:create')")
    public ApiResponse<ReviewResponse> update(@PathVariable UUID id,
                                              @Valid @RequestBody CreateReviewRequest request) {
        var saved = reviewService.update(id, request);
        return ApiResponse.ok(ReviewResponse.from(saved, reviewService.tagIds(saved.getId())));
    }

    @DeleteMapping("/reviews/{id}")
    @PreAuthorize("hasAuthority('review:create') or hasAuthority('comment:moderate')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        reviewService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
