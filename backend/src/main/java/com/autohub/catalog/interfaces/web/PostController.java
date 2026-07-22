package com.autohub.catalog.interfaces.web;

import com.autohub.shared.interfaces.web.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

/**
 * Catalog (car/bike posts) web adapter.
 *
 * <p>SCAFFOLD: the read endpoint returns representative sample data and the create endpoint
 * demonstrates permission-gated access ({@code post:create}) and rich-text/relationship shape.
 * The full application + persistence layers for this context are delivered in Sprint&nbsp;2
 * (see docs/agile/sprint-plan.md).
 */
@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    /** Sample post projection returned to the web/feed. */
    public record PostSummary(String id, String kind, String title, String slug,
                              String author, Instant publishedAt) {}

    /** Create payload — body is sanitized rich-text HTML; images are attached separately (max 20). */
    public record CreatePostRequest(
            @NotBlank @Pattern(regexp = "CAR|BIKE") String kind,
            @NotBlank String title,
            String bodyHtml) {}

    @GetMapping
    public ResponseEntity<ApiResponse<List<PostSummary>>> list() {
        List<PostSummary> sample = List.of(
                new PostSummary("11111111-1111-1111-1111-111111111111", "CAR",
                        "2024 Tesla Model 3 — Long-term review", "tesla-model-3-review",
                        "superadmin", Instant.parse("2024-05-01T10:00:00Z")),
                new PostSummary("22222222-2222-2222-2222-222222222222", "BIKE",
                        "Royal Enfield Himalayan 450 first ride", "re-himalayan-450",
                        "superadmin", Instant.parse("2024-06-12T08:30:00Z")));
        return ResponseEntity.ok(ApiResponse.ok(sample));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('post:create')")
    public ResponseEntity<ApiResponse<PostSummary>> create(@Valid @RequestBody CreatePostRequest request) {
        // SCAFFOLD: echo back a created summary. Real implementation persists via a use case,
        // sanitizes bodyHtml, and emits catalog.post.published through the Outbox.
        PostSummary created = new PostSummary(
                "00000000-0000-0000-0000-000000000000", request.kind(), request.title(),
                slugify(request.title()), "me", Instant.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created));
    }

    private static String slugify(String title) {
        return title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
    }
}
