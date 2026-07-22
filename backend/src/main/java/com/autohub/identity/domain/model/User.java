package com.autohub.identity.domain.model;

import java.util.Set;
import java.util.UUID;

/**
 * User aggregate (domain model) — framework-free. Persistence and security concerns live
 * in the infrastructure layer; this type only expresses identity state and behaviour.
 */
public class User {

    private final UUID id;
    private final String email;
    private final String username;
    private final String passwordHash;
    private final String displayName;
    private final UserStatus status;
    private final Set<String> roleCodes;
    private final Set<String> permissionCodes;

    public User(UUID id, String email, String username, String passwordHash, String displayName,
                UserStatus status, Set<String> roleCodes, Set<String> permissionCodes) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
        this.status = status;
        this.roleCodes = roleCodes == null ? Set.of() : Set.copyOf(roleCodes);
        this.permissionCodes = permissionCodes == null ? Set.of() : Set.copyOf(permissionCodes);
    }

    public boolean canAuthenticate() {
        return status == UserStatus.ACTIVE;
    }

    public boolean hasPermission(String permissionCode) {
        return permissionCodes.contains(permissionCode);
    }

    public UUID getId() { return id; }
    public String getEmail() { return email; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public String getDisplayName() { return displayName; }
    public UserStatus getStatus() { return status; }
    public Set<String> getRoleCodes() { return roleCodes; }
    public Set<String> getPermissionCodes() { return permissionCodes; }
}
