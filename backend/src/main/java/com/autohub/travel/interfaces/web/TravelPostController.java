package com.autohub.travel.interfaces.web;

import com.autohub.shared.interfaces.web.ApiResponse;
import com.autohub.travel.application.TravelPostService;
import com.autohub.travel.infrastructure.persistence.TravelPostEntity;
import com.autohub.travel.infrastructure.persistence.TravelPostImageEntity;
import com.autohub.travel.interfaces.web.dto.CreateTravelPostRequest;
import com.autohub.travel.interfaces.web.dto.TravelPostImageResponse;
import com.autohub.travel.interfaces.web.dto.TravelPostResponse;
import com.autohub.travel.interfaces.web.dto.TravelPostSummaryResponse;
import com.autohub.travel.interfaces.web.dto.UpdateTravelPostRequest;
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
 * Travel blog web adapter. Reads of published posts are public; authoring and publishing are
 * permission-gated ({@code travel:create}) and ownership-checked in the service.
 */
@RestController
@RequestMapping("/api/v1/travel/posts")
public class TravelPostController {

    private final TravelPostService travelPostService;

    public TravelPostController(TravelPostService travelPostService) {
        this.travelPostService = travelPostService;
    }

    // ---- reads ----

    @GetMapping
    public ApiResponse<List<TravelPostSummaryResponse>> list() {
        return ApiResponse.ok(travelPostService.listPublished().stream()
                .map(TravelPostSummaryResponse::of).toList());
    }

    @GetMapping("/mine")
    public ApiResponse<List<TravelPostSummaryResponse>> mine() {
        return ApiResponse.ok(travelPostService.listMine().stream()
                .map(TravelPostSummaryResponse::of).toList());
    }

    @GetMapping("/{slug}")
    public ApiResponse<TravelPostResponse> detail(@PathVariable String slug) {
        TravelPostEntity post = travelPostService.getVisibleBySlug(slug);
        return ApiResponse.ok(TravelPostResponse.from(post, travelPostService.imagesOf(post.getId())));
    }

    // ---- writes ----

    @PostMapping
    @PreAuthorize("hasAuthority('travel:create')")
    public ResponseEntity<ApiResponse<TravelPostResponse>> create(
            @Valid @RequestBody CreateTravelPostRequest request) {
        TravelPostEntity post = travelPostService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(TravelPostResponse.from(post)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('travel:create')")
    public ApiResponse<TravelPostResponse> update(@PathVariable UUID id,
                                                  @Valid @RequestBody UpdateTravelPostRequest request) {
        TravelPostEntity post = travelPostService.update(id, request);
        return ApiResponse.ok(TravelPostResponse.from(post));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAuthority('travel:create')")
    public ApiResponse<TravelPostResponse> publish(@PathVariable UUID id) {
        TravelPostEntity post = travelPostService.publish(id);
        return ApiResponse.ok(TravelPostResponse.from(post, travelPostService.imagesOf(id)));
    }

    // ---- images ----

    @PostMapping("/{id}/images")
    @PreAuthorize("hasAuthority('travel:create')")
    public ApiResponse<List<TravelPostImageResponse>> uploadImages(
            @PathVariable UUID id, @RequestParam("files") List<MultipartFile> files) {
        List<TravelPostImageEntity> imgs = travelPostService.addImages(id, files);
        return ApiResponse.ok(imgs.stream().map(TravelPostImageResponse::from).toList());
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @PreAuthorize("hasAuthority('travel:create')")
    public ResponseEntity<Void> removeImage(@PathVariable UUID id, @PathVariable UUID imageId) {
        travelPostService.removeImage(id, imageId);
        return ResponseEntity.noContent().build();
    }
}
