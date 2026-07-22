package com.autohub.identity.domain.port;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Outbound port for refresh-token persistence and revocation. The application layer depends
 * only on this interface; a JPA adapter in the infrastructure layer provides the implementation.
 *
 * <p>Only a hash of the refresh token is ever stored, so callers pass the pre-computed hash.
 */
public interface RefreshTokenRepository {

    /** Persists a new refresh token (by hash) for the user with the given expiry. */
    void save(UUID userId, String tokenHash, Instant expiresAt);

    /** Looks up a stored refresh token by its hash, regardless of revoked/expired state. */
    Optional<StoredRefreshToken> findByHash(String tokenHash);

    /** Revokes the token matching the hash, if present. Idempotent. */
    void revokeByHash(String tokenHash);

    /** Revokes every currently-active refresh token belonging to the user. */
    void revokeAllForUser(UUID userId);

    /** Read model for a persisted refresh token row. */
    record StoredRefreshToken(UUID id, UUID userId, String tokenHash, Instant expiresAt, boolean revoked) {

        public boolean isExpired(Instant now) {
            return expiresAt.isBefore(now);
        }
    }
}
