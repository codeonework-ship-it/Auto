package com.autohub.identity.infrastructure.security;

import com.autohub.identity.application.port.TokenService;
import com.autohub.identity.domain.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/** JWT implementation of the {@link TokenService} port using JJWT. */
@Service
public class JwtTokenService implements TokenService {

    private final SecretKey key;
    private final long accessTtlMinutes;
    private final long refreshTtlDays;

    public JwtTokenService(
            @Value("${autohub.security.jwt.secret}") String secret,
            @Value("${autohub.security.jwt.access-token-ttl-minutes:30}") long accessTtlMinutes,
            @Value("${autohub.security.jwt.refresh-token-ttl-days:7}") long refreshTtlDays) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTtlMinutes = accessTtlMinutes;
        this.refreshTtlDays = refreshTtlDays;
    }

    @Override
    public TokenPair issueTokens(User user) {
        Instant now = Instant.now();
        Instant accessExp = now.plus(accessTtlMinutes, ChronoUnit.MINUTES);
        Instant refreshExp = now.plus(refreshTtlDays, ChronoUnit.DAYS);

        String access = Jwts.builder()
                .id(UUID.randomUUID().toString())   // jti — keeps every issued token unique
                .subject(user.getEmail())
                .claim("uid", user.getId().toString())
                .claim("username", user.getUsername())
                .claim("roles", List.copyOf(user.getRoleCodes()))
                .claim("permissions", List.copyOf(user.getPermissionCodes()))
                .issuedAt(Date.from(now))
                .expiration(Date.from(accessExp))
                .signWith(key)
                .compact();

        String refresh = Jwts.builder()
                .id(UUID.randomUUID().toString())   // jti — unique per issuance so token_hash never collides
                .subject(user.getEmail())
                .claim("uid", user.getId().toString())
                .claim("type", "refresh")
                .issuedAt(Date.from(now))
                .expiration(Date.from(refreshExp))
                .signWith(key)
                .compact();

        return new TokenPair(access, refresh, accessTtlMinutes * 60);
    }

    @Override
    public RefreshClaims parseRefresh(String refreshToken) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(refreshToken)
                    .getPayload();
            if (!"refresh".equals(claims.get("type", String.class))) {
                throw new BadCredentialsException("Not a refresh token");
            }
            return new RefreshClaims(
                    claims.getSubject(),
                    UUID.fromString(claims.get("uid", String.class)),
                    claims.getExpiration().toInstant());
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BadCredentialsException("Invalid refresh token");
        }
    }

    public SecretKey key() {
        return key;
    }
}
