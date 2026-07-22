package com.autohub.community.interfaces.web.dto;

import java.util.List;

/** A list of follow edges (following or followers) plus the caller's aggregate counts. */
public record FollowListResponse(List<FollowUserResponse> users, long followingCount, long followerCount) {
}
