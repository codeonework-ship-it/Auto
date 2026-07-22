package com.autohub.shared.domain.exception;

/** Base type for expected, business-meaningful failures raised by the domain/application layers. */
public abstract class DomainException extends RuntimeException {
    protected DomainException(String message) {
        super(message);
    }
}
