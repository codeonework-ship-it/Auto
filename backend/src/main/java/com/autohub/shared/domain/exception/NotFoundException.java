package com.autohub.shared.domain.exception;

/** Raised when a requested aggregate/resource does not exist. Maps to HTTP 404. */
public class NotFoundException extends DomainException {
    public NotFoundException(String message) {
        super(message);
    }
}
