package com.autohub.identity.application;

import com.autohub.identity.application.port.PasswordHasher;
import com.autohub.identity.application.port.TokenService;
import com.autohub.identity.domain.event.UserRegisteredEvent;
import com.autohub.identity.domain.model.User;
import com.autohub.identity.domain.port.RefreshTokenRepository;
import com.autohub.identity.domain.port.UserRepository;
import com.autohub.shared.application.port.CurrentUser;
import com.autohub.shared.application.port.DomainEventPublisher;
import com.autohub.shared.domain.exception.ConflictException;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Identity use cases: registration and login. Depends only on domain ports
 * ({@link UserRepository}, {@link PasswordHasher}, {@link TokenService},
 * {@link DomainEventPublisher}) — the Clean Architecture dependency rule.
 *
 * <p>New signups get the {@code MEMBER} role, which grants comment/review permissions —
 * this is what enforces "must sign up to comment".
 */
@Service
public class AuthService {

    private static final String DEFAULT_ROLE = "MEMBER";

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordHasher passwordHasher;
    private final TokenService tokenService;
    private final DomainEventPublisher eventPublisher;
    private final CurrentUser currentUser;

    public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
                       PasswordHasher passwordHasher, TokenService tokenService,
                       DomainEventPublisher eventPublisher, CurrentUser currentUser) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
        this.eventPublisher = eventPublisher;
        this.currentUser = currentUser;
    }

    @Transactional
    public TokenService.TokenPair register(String email, String username, String rawPassword, String displayName) {
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email is already registered");
        }
        if (userRepository.existsByUsername(username)) {
            throw new ConflictException("Username is already taken");
        }
        User user = userRepository.createWithRole(
                email, username, passwordHasher.hash(rawPassword), displayName, DEFAULT_ROLE);

        // Persisted to the Outbox in the same transaction as the user row.
        eventPublisher.publish(new UserRegisteredEvent(
                user.getId().toString(), user.getEmail(), user.getUsername(), Instant.now()));

        return issueAndPersist(user);
    }

    @Transactional
    public TokenService.TokenPair login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (!user.canAuthenticate()) {
            throw new BadCredentialsException("Account is not active");
        }
        if (!passwordHasher.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        return issueAndPersist(user);
    }

    /**
     * Rotating refresh: validates the refresh JWT, ensures the stored (hashed) row exists,
     * is not revoked and not expired, then revokes it and issues a fresh access+refresh pair.
     * Any failure yields {@link BadCredentialsException} → 401.
     */
    @Transactional
    public TokenService.TokenPair refresh(String refreshTokenString) {
        TokenService.RefreshClaims claims = tokenService.parseRefresh(refreshTokenString);
        String hash = sha256(refreshTokenString);

        var stored = refreshTokenRepository.findByHash(hash)
                .orElseThrow(() -> new BadCredentialsException("Refresh token not recognised"));
        if (stored.revoked() || stored.isExpired(Instant.now())) {
            throw new BadCredentialsException("Refresh token is no longer valid");
        }

        User user = userRepository.findById(claims.userId())
                .orElseThrow(() -> new BadCredentialsException("Refresh token subject not found"));
        if (!user.canAuthenticate()) {
            throw new BadCredentialsException("Account is not active");
        }

        // Rotate: revoke the presented token, then mint and persist a new pair.
        refreshTokenRepository.revokeByHash(hash);
        return issueAndPersist(user);
    }

    /** Revokes the stored refresh token matching the presented string. Idempotent. */
    @Transactional
    public void logout(String refreshTokenString) {
        refreshTokenRepository.revokeByHash(sha256(refreshTokenString));
    }

    /**
     * Changes the authenticated user's password after verifying the current one, then revokes
     * all of their refresh tokens so existing sessions must re-authenticate.
     */
    @Transactional
    public void changePassword(String currentPassword, String newPassword) {
        UUID userId = currentUser.requireUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (!passwordHasher.matches(currentPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        userRepository.updatePassword(userId, passwordHasher.hash(newPassword));
        refreshTokenRepository.revokeAllForUser(userId);
    }

    @Transactional(readOnly = true)
    public User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }

    /** Issues a token pair and persists the SHA-256 hash of the refresh token for later rotation. */
    private TokenService.TokenPair issueAndPersist(User user) {
        TokenService.TokenPair pair = tokenService.issueTokens(user);
        TokenService.RefreshClaims claims = tokenService.parseRefresh(pair.refreshToken());
        refreshTokenRepository.save(user.getId(), sha256(pair.refreshToken()), claims.expiresAt());
        return pair;
    }

    private static String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            // SHA-256 is guaranteed present on every JVM.
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }
}
