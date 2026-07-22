package com.autohub.identity.infrastructure.persistence;

import com.autohub.identity.domain.model.User;
import com.autohub.identity.domain.model.UserStatus;
import com.autohub.identity.domain.port.UserRepository;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * JPA adapter implementing the {@link UserRepository} domain port. Maps between the
 * persistence model ({@link UserEntity}) and the pure domain {@link User} aggregate.
 */
@Component
public class UserRepositoryAdapter implements UserRepository {

    private final UserJpaRepository userJpa;
    private final RoleJpaRepository roleJpa;

    public UserRepositoryAdapter(UserJpaRepository userJpa, RoleJpaRepository roleJpa) {
        this.userJpa = userJpa;
        this.roleJpa = roleJpa;
    }

    @Override
    public Optional<User> findById(UUID id) {
        return userJpa.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userJpa.findByEmail(email).map(this::toDomain);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userJpa.findByUsername(username).map(this::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userJpa.existsByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userJpa.existsByUsername(username);
    }

    @Override
    public User createWithRole(String email, String username, String passwordHash,
                               String displayName, String roleCode) {
        RoleEntity role = roleJpa.findByCode(roleCode)
                .orElseThrow(() -> new NotFoundException("Role not found: " + roleCode));
        UserEntity entity = new UserEntity(UUID.randomUUID(), email, username, passwordHash, displayName);
        entity.addRole(role);
        return toDomain(userJpa.save(entity));
    }

    @Override
    public void updatePassword(UUID userId, String newPasswordHash) {
        UserEntity entity = userJpa.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        entity.setPasswordHash(newPasswordHash);
        userJpa.save(entity);
    }

    private User toDomain(UserEntity e) {
        Set<String> roleCodes = e.getRoles().stream()
                .map(RoleEntity::getCode)
                .collect(Collectors.toSet());
        Set<String> permissionCodes = e.getRoles().stream()
                .flatMap(r -> r.getPermissions().stream())
                .map(PermissionEntity::getCode)
                .collect(Collectors.toSet());
        return new User(
                e.getId(), e.getEmail(), e.getUsername(), e.getPasswordHash(), e.getDisplayName(),
                UserStatus.valueOf(e.getStatus()), roleCodes, permissionCodes);
    }
}
