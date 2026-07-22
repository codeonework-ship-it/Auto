package com.autohub.identity.application;

import com.autohub.identity.application.port.PasswordHasher;
import com.autohub.identity.application.port.TokenService;
import com.autohub.identity.domain.event.UserRegisteredEvent;
import com.autohub.identity.domain.model.User;
import com.autohub.identity.domain.port.UserRepository;
import com.autohub.shared.application.port.DomainEventPublisher;
import com.autohub.shared.domain.exception.ConflictException;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

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
    private final PasswordHasher passwordHasher;
    private final TokenService tokenService;
    private final DomainEventPublisher eventPublisher;

    public AuthService(UserRepository userRepository, PasswordHasher passwordHasher,
                       TokenService tokenService, DomainEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
        this.eventPublisher = eventPublisher;
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

        return tokenService.issueTokens(user);
    }

    @Transactional(readOnly = true)
    public TokenService.TokenPair login(String email, String rawPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (!user.canAuthenticate()) {
            throw new BadCredentialsException("Account is not active");
        }
        if (!passwordHasher.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        return tokenService.issueTokens(user);
    }

    @Transactional(readOnly = true)
    public User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
