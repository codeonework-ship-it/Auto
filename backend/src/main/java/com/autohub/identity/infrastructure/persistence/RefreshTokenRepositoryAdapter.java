package com.autohub.identity.infrastructure.persistence;

import com.autohub.identity.domain.port.RefreshTokenRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * JPA adapter implementing the {@link RefreshTokenRepository} domain port. Maps between the
 * persistence model ({@link RefreshTokenEntity}) and the {@link StoredRefreshToken} read model.
 */
@Component
public class RefreshTokenRepositoryAdapter implements RefreshTokenRepository {

    private final RefreshTokenJpaRepository refreshTokenJpa;

    public RefreshTokenRepositoryAdapter(RefreshTokenJpaRepository refreshTokenJpa) {
        this.refreshTokenJpa = refreshTokenJpa;
    }

    @Override
    public void save(UUID userId, String tokenHash, Instant expiresAt) {
        refreshTokenJpa.save(new RefreshTokenEntity(UUID.randomUUID(), userId, tokenHash, expiresAt));
    }

    @Override
    public Optional<StoredRefreshToken> findByHash(String tokenHash) {
        return refreshTokenJpa.findByTokenHash(tokenHash).map(this::toReadModel);
    }

    @Override
    public void revokeByHash(String tokenHash) {
        refreshTokenJpa.findByTokenHash(tokenHash).ifPresent(entity -> {
            if (!entity.isRevoked()) {
                entity.revoke();
                refreshTokenJpa.save(entity);
            }
        });
    }

    @Override
    public void revokeAllForUser(UUID userId) {
        List<RefreshTokenEntity> active = refreshTokenJpa.findByUserIdAndRevokedFalse(userId);
        active.forEach(RefreshTokenEntity::revoke);
        refreshTokenJpa.saveAll(active);
    }

    private StoredRefreshToken toReadModel(RefreshTokenEntity e) {
        return new StoredRefreshToken(
                e.getId(), e.getUserId(), e.getTokenHash(), e.getExpiresAt(), e.isRevoked());
    }
}
