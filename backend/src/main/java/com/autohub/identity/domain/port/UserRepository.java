package com.autohub.identity.domain.port;

import com.autohub.identity.domain.model.User;

import java.util.Optional;
import java.util.UUID;

/**
 * Outbound port for user persistence. The domain/application layers depend only on this
 * interface; a JPA adapter in the infrastructure layer provides the implementation.
 */
public interface UserRepository {

    Optional<User> findById(UUID id);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    /**
     * Persists a brand-new user with the given role code and returns the stored aggregate.
     */
    User createWithRole(String email, String username, String passwordHash,
                        String displayName, String roleCode);

    /** Replaces the stored password hash for the given user. */
    void updatePassword(UUID userId, String newPasswordHash);
}
