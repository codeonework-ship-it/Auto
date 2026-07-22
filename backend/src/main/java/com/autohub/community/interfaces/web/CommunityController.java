package com.autohub.community.interfaces.web;

import com.autohub.community.application.CommunityService;
import com.autohub.community.infrastructure.persistence.CommunityEntity;
import com.autohub.community.interfaces.web.dto.CreateGroupRequest;
import com.autohub.community.interfaces.web.dto.GroupResponse;
import com.autohub.shared.interfaces.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Community groups web adapter. Listing and detail are public; creating a group requires the
 * {@code community:create} permission, and join/leave/mine require authentication.
 */
@RestController
@RequestMapping("/api/v1/community/groups")
public class CommunityController {

    private final CommunityService communityService;

    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    // ---- reads ----

    @GetMapping
    public ApiResponse<List<GroupResponse>> list() {
        return ApiResponse.ok(communityService.listAll().stream().map(this::toResponse).toList());
    }

    @GetMapping("/mine")
    public ApiResponse<List<GroupResponse>> mine() {
        return ApiResponse.ok(communityService.listMine().stream().map(this::toResponse).toList());
    }

    @GetMapping("/{slug}")
    public ApiResponse<GroupResponse> detail(@PathVariable String slug) {
        return ApiResponse.ok(toResponse(communityService.getBySlug(slug)));
    }

    // ---- writes ----

    @PostMapping
    @PreAuthorize("hasAuthority('community:create')")
    public ResponseEntity<ApiResponse<GroupResponse>> create(@Valid @RequestBody CreateGroupRequest request) {
        CommunityEntity group = communityService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(toResponse(group)));
    }

    @PostMapping("/{id}/join")
    public ApiResponse<Void> join(@PathVariable UUID id) {
        communityService.join(id);
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/{id}/leave")
    public ApiResponse<Void> leave(@PathVariable UUID id) {
        communityService.leave(id);
        return ApiResponse.ok(null);
    }

    // ---- mapping ----

    private GroupResponse toResponse(CommunityEntity group) {
        return GroupResponse.of(group, communityService.memberCount(group.getId()));
    }
}
