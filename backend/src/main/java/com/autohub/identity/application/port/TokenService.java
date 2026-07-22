package com.autohub.identity.application.port;

import com.autohub.identity.domain.model.User;

import java.time.Instant;
import java.util.UUID;

/** Outbound port for issuing authentication tokens (adapter: JWT). */
public interface TokenService {

    TokenPair issueTokens(User user);

    /**
     * Validates a refresh-token string (signature, {@code type=refresh}, not expired) and
     * returns its claims. Implementations throw
     * {@link org.springframework.security.authentication.BadCredentialsException} when the
     * token is malformed, wrong-typed, or expired.
     */
    RefreshClaims parseRefresh(String refreshToken);

    record TokenPair(String accessToken, String refreshToken, long expiresInSeconds) {}

    record RefreshClaims(String email, UUID userId, Instant expiresAt) {}
}
