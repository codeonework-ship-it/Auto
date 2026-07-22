package com.autohub.community.interfaces.web.dto;

import java.time.Instant;

/** A user on either side of a follow edge, with the edge creation time. */
public record FollowUserResponse(String userId, Instant since) {
}
