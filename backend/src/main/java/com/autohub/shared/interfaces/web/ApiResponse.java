package com.autohub.shared.interfaces.web;

import java.time.Instant;

/**
 * Uniform success envelope returned by REST controllers.
 */
public record ApiResponse<T>(boolean success, T data, Instant timestamp) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, Instant.now());
    }
}
