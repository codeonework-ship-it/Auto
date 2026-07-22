package com.autohub.identity.interfaces.web;

import com.autohub.identity.application.AdminUserService;
import com.autohub.identity.infrastructure.persistence.RoleEntity;
import com.autohub.identity.infrastructure.persistence.UserEntity;
import com.autohub.identity.infrastructure.persistence.UserJpaRepository;
import com.autohub.identity.interfaces.web.dto.SetRolesRequest;
import com.autohub.identity.interfaces.web.dto.SetStatusRequest;
import com.autohub.shared.interfaces.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * User management (control-panel). Guarded by the {@code user:manage} permission — held by
 * SUPER_ADMIN / ADMIN. Supports listing users, assigning roles, and changing account status.
 */
@RestController
@RequestMapping("/api/v1/users")
@PreAuthorize("hasAuthority('user:manage')")
public class UserAdminController {

    public record UserRow(String id, String email, String username, String status, Set<String> roles) {
        static UserRow from(UserEntity e) {
            Set<String> roles = e.getRoles().stream().map(RoleEntity::getCode).collect(Collectors.toSet());
            return new UserRow(e.getId().toString(), e.getEmail(), e.getUsername(), e.getStatus(), roles);
        }
    }

    private final UserJpaRepository userJpa;
    private final AdminUserService adminUserService;

    public UserAdminController(UserJpaRepository userJpa, AdminUserService adminUserService) {
        this.userJpa = userJpa;
        this.adminUserService = adminUserService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ApiResponse<List<UserRow>> list() {
        return ApiResponse.ok(userJpa.findAll().stream().map(UserRow::from).toList());
    }

    @PutMapping("/{id}/roles")
    public ApiResponse<UserRow> setRoles(@PathVariable UUID id, @Valid @RequestBody SetRolesRequest request) {
        return ApiResponse.ok(UserRow.from(adminUserService.setRoles(id, request.roleCodes())));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<UserRow> setStatus(@PathVariable UUID id, @Valid @RequestBody SetStatusRequest request) {
        return ApiResponse.ok(UserRow.from(adminUserService.setStatus(id, request.status())));
    }
}
