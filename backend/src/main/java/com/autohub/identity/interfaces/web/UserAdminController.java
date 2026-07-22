package com.autohub.identity.interfaces.web;

import com.autohub.identity.infrastructure.persistence.RoleEntity;
import com.autohub.identity.infrastructure.persistence.UserEntity;
import com.autohub.identity.infrastructure.persistence.UserJpaRepository;
import com.autohub.shared.interfaces.web.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * User management (control-panel). Guarded by the {@code user:manage} permission — only roles
 * that hold it (SUPER_ADMIN / ADMIN) can list users.
 */
@RestController
@RequestMapping("/api/v1/users")
public class UserAdminController {

    public record UserRow(String id, String email, String username, String status, Set<String> roles) {}

    private final UserJpaRepository userJpa;

    public UserAdminController(UserJpaRepository userJpa) {
        this.userJpa = userJpa;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('user:manage')")
    @Transactional(readOnly = true)
    public ApiResponse<List<UserRow>> list() {
        List<UserRow> rows = userJpa.findAll().stream()
                .map(this::toRow)
                .toList();
        return ApiResponse.ok(rows);
    }

    private UserRow toRow(UserEntity e) {
        Set<String> roles = e.getRoles().stream().map(RoleEntity::getCode).collect(Collectors.toSet());
        return new UserRow(e.getId().toString(), e.getEmail(), e.getUsername(), e.getStatus(), roles);
    }
}
