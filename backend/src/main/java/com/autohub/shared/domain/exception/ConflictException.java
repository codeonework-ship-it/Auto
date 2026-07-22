package com.autohub.shared.domain.exception;

/** Raised on a business conflict (e.g. duplicate email). Maps to HTTP 409. */
public class ConflictException extends DomainException {
    public ConflictException(String message) {
        super(message);
    }
}
