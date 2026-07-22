package com.autohub.marketplace.interfaces.web.dto;

/** Optional reason supplied by a moderator when rejecting a listing. */
public record RejectListingRequest(String reason) {
}
