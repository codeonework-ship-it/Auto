package com.autohub.identity.infrastructure.security;

import com.autohub.identity.infrastructure.persistence.UserEntity;
import com.autohub.identity.infrastructure.persistence.UserJpaRepository;
import com.autohub.shared.application.port.CurrentUser;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Resolves the authenticated principal from the SecurityContext. The JWT filter sets the
 * principal name to the user's email and populates permission authorities.
 */
@Component
public class CurrentUserAdapter implements CurrentUser {

    private final UserJpaRepository userJpa;

    public CurrentUserAdapter(UserJpaRepository userJpa) {
        this.userJpa = userJpa;
    }

    @Override
    public UUID requireUserId() {
        UserEntity user = userJpa.findByEmail(requireEmail())
                .orElseThrow(() -> new NotFoundException("Authenticated user not found"));
        return user.getId();
    }

    @Override
    public String requireEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName() == null) {
            throw new IllegalStateException("No authenticated user");
        }
        return authentication.getName();
    }

    @Override
    public boolean hasPermission(String permissionCode) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            if (authority.getAuthority().equals(permissionCode)) {
                return true;
            }
        }
        return false;
    }
}
