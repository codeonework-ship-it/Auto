package com.autohub.identity.infrastructure.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Validates the Bearer JWT on each request and populates the SecurityContext with
 * authorities derived from the token's {@code roles} (prefixed {@code ROLE_}) and
 * {@code permissions} claims. Permissions map 1:1 to {@code @PreAuthorize("hasAuthority(...)")}.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenService tokenService;

    public JwtAuthenticationFilter(JwtTokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = header.substring(7);
            try {
                Claims claims = Jwts.parser()
                        .verifyWith(tokenService.key())
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
                List<String> roles = claims.get("roles", List.class);
                if (roles != null) {
                    roles.forEach(r -> authorities.add(new SimpleGrantedAuthority("ROLE_" + r)));
                }
                List<String> permissions = claims.get("permissions", List.class);
                if (permissions != null) {
                    permissions.forEach(p -> authorities.add(new SimpleGrantedAuthority(p)));
                }

                var authentication = new UsernamePasswordAuthenticationToken(
                        claims.getSubject(), null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception ex) {
                // Invalid/expired token → leave context unauthenticated; endpoint rules decide.
                SecurityContextHolder.clearContext();
            }
        }
        filterChain.doFilter(request, response);
    }
}
