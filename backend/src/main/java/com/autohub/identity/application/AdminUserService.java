package com.autohub.identity.application;

import com.autohub.identity.domain.model.UserStatus;
import com.autohub.identity.infrastructure.persistence.RoleEntity;
import com.autohub.identity.infrastructure.persistence.RoleJpaRepository;
import com.autohub.identity.infrastructure.persistence.UserEntity;
import com.autohub.identity.infrastructure.persistence.UserJpaRepository;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/** User administration (control-panel). Requires {@code user:manage}. */
@Service
public class AdminUserService {

    private final UserJpaRepository userJpa;
    private final RoleJpaRepository roleJpa;

    public AdminUserService(UserJpaRepository userJpa, RoleJpaRepository roleJpa) {
        this.userJpa = userJpa;
        this.roleJpa = roleJpa;
    }

    @Transactional
    public UserEntity setRoles(UUID userId, Collection<String> roleCodes) {
        UserEntity user = findUser(userId);
        List<RoleEntity> roles = roleJpa.findByCodeIn(roleCodes);
        if (roles.size() != new HashSet<>(roleCodes).size()) {
            throw new IllegalArgumentException("One or more role codes are unknown");
        }
        user.setRoles(new HashSet<>(roles));
        return userJpa.save(user);
    }

    @Transactional
    public UserEntity setStatus(UUID userId, String status) {
        UserEntity user = findUser(userId);
        UserStatus parsed;
        try {
            parsed = UserStatus.valueOf(status.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        user.setStatus(parsed.name());
        return userJpa.save(user);
    }

    private UserEntity findUser(UUID userId) {
        return userJpa.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found: " + userId));
    }
}
