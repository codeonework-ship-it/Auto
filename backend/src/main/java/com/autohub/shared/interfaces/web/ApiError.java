package com.autohub.shared.interfaces.web;

import java.time.Instant;
import java.util.List;

/**
 * Uniform error envelope. {@code fieldErrors} carries per-field validation messages.
 */
public record ApiError(boolean success,
                       int status,
                       String error,
                       String message,
                       List<FieldError> fieldErrors,
                       Instant timestamp) {

    public record FieldError(String field, String message) {}

    public static ApiError of(int status, String error, String message, List<FieldError> fieldErrors) {
        return new ApiError(false, status, error, message,
                fieldErrors == null ? List.of() : fieldErrors, Instant.now());
    }
}
