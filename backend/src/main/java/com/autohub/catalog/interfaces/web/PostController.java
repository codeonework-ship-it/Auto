package com.autohub.catalog.interfaces.web;

import com.autohub.catalog.application.PostService;
import com.autohub.catalog.infrastructure.persistence.PostEntity;
import com.autohub.catalog.infrastructure.persistence.PostImageEntity;
import com.autohub.catalog.interfaces.web.dto.CreatePostRequest;
import com.autohub.catalog.interfaces.web.dto.PostImageResponse;
import com.autohub.catalog.interfaces.web.dto.PostResponse;
import com.autohub.catalog.interfaces.web.dto.PostSummaryResponse;
import com.autohub.catalog.interfaces.web.dto.UpdatePostRequest;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * Catalog (car/bike posts) web adapter. Reads of published posts are public; authoring,
 * publishing and image upload are permission-gated and ownership-checked in the service.
 */
@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    // ---- reads ----

    @GetMapping
    public ApiResponse<List<PostSummaryResponse>> list(
            @RequestParam(required = false) String kind,
            @RequestParam(required = false) String make,
            @RequestParam(required = false) String model) {
        return ApiResponse.ok(
                postService.listPublished(kind, make, model).stream().map(this::toSummary).toList());
    }

    @GetMapping("/mine")
    public ApiResponse<List<PostSummaryResponse>> mine() {
        return ApiResponse.ok(postService.listMine().stream().map(this::toSummary).toList());
    }

    @GetMapping("/{slug}")
    public ApiResponse<PostResponse> detail(@PathVariable String slug) {
        PostEntity post = postService.getVisibleBySlug(slug);
        return ApiResponse.ok(PostResponse.from(post, postService.imagesOf(post.getId())));
    }

    // ---- writes ----

    @PostMapping
    @PreAuthorize("hasAuthority('post:create')")
    public ResponseEntity<ApiResponse<PostResponse>> create(@Valid @RequestBody CreatePostRequest request) {
        PostEntity post = postService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(PostResponse.from(post, List.of())));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('post:create')")
    public ApiResponse<PostResponse> update(@PathVariable UUID id, @Valid @RequestBody UpdatePostRequest request) {
        PostEntity post = postService.update(id, request);
        return ApiResponse.ok(PostResponse.from(post, postService.imagesOf(id)));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAuthority('post:publish') or hasAuthority('post:create')")
    public ApiResponse<PostResponse> publish(@PathVariable UUID id) {
        PostEntity post = postService.publish(id);
        return ApiResponse.ok(PostResponse.from(post, postService.imagesOf(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('post:create') or hasAuthority('post:moderate')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        postService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ---- images ----

    @PostMapping("/{id}/images")
    @PreAuthorize("hasAuthority('image:upload')")
    public ApiResponse<List<PostImageResponse>> uploadImages(@PathVariable UUID id,
                                                             @RequestParam("files") List<MultipartFile> files) {
        List<PostImageEntity> images = postService.addImages(id, files);
        return ApiResponse.ok(images.stream().map(PostImageResponse::from).toList());
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @PreAuthorize("hasAuthority('image:upload')")
    public ResponseEntity<Void> removeImage(@PathVariable UUID id, @PathVariable UUID imageId) {
        postService.removeImage(id, imageId);
        return ResponseEntity.noContent().build();
    }

    // ---- mapping ----

    private PostSummaryResponse toSummary(PostEntity post) {
        List<PostImageEntity> imgs = postService.imagesOf(post.getId());
        String cover = imgs.isEmpty() ? null : imgs.get(0).getUrl();
        return PostSummaryResponse.of(post, imgs.size(), cover);
    }
}
