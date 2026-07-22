package com.autohub.community.interfaces.web;

import com.autohub.community.application.FollowService;
import com.autohub.community.infrastructure.persistence.FollowEntity;
import com.autohub.community.interfaces.web.dto.FollowListResponse;
import com.autohub.community.interfaces.web.dto.FollowRequest;
import com.autohub.community.interfaces.web.dto.FollowUserResponse;
import com.autohub.shared.interfaces.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
 * Social follows web adapter. All endpoints require authentication; the caller is always the
 * follower. A user cannot follow themselves (400) and duplicate follows conflict (409).
 */
@RestController
@RequestMapping("/api/v1/community/follows")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FollowUserResponse>> follow(@Valid @RequestBody FollowRequest request) {
        FollowEntity edge = followService.follow(parseUuid(request.targetUserId()));
        FollowUserResponse body = new FollowUserResponse(edge.getFollowingId().toString(), edge.getCreatedAt());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(body));
    }

    @DeleteMapping("/{targetUserId}")
    public ApiResponse<Void> unfollow(@PathVariable UUID targetUserId) {
        followService.unfollow(targetUserId);
        return ApiResponse.ok(null);
    }

    @GetMapping("/following")
    public ApiResponse<FollowListResponse> following() {
        List<FollowUserResponse> users = followService.following().stream()
                .map(e -> new FollowUserResponse(e.getFollowingId().toString(), e.getCreatedAt()))
                .toList();
        return ApiResponse.ok(new FollowListResponse(
                users, followService.followingCount(), followService.followerCount()));
    }

    @GetMapping("/followers")
    public ApiResponse<FollowListResponse> followers() {
        List<FollowUserResponse> users = followService.followers().stream()
                .map(e -> new FollowUserResponse(e.getFollowerId().toString(), e.getCreatedAt()))
                .toList();
        return ApiResponse.ok(new FollowListResponse(
                users, followService.followingCount(), followService.followerCount()));
    }

    private static UUID parseUuid(String value) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID: " + value);
        }
    }
}
