package com.autohub.identity.application;

import com.autohub.identity.infrastructure.persistence.PermissionEntity;
import com.autohub.identity.infrastructure.persistence.PermissionJpaRepository;
import com.autohub.identity.infrastructure.persistence.RoleEntity;
import com.autohub.identity.infrastructure.persistence.RoleJpaRepository;
import com.autohub.identity.interfaces.web.dto.PermissionView;
import com.autohub.identity.interfaces.web.dto.RoleView;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

/** Role & permission administration (control-panel). Requires {@code role:manage}. */
@Service
public class RoleAdminService {

    private final RoleJpaRepository roleJpa;
    private final PermissionJpaRepository permissionJpa;

    public RoleAdminService(RoleJpaRepository roleJpa, PermissionJpaRepository permissionJpa) {
        this.roleJpa = roleJpa;
        this.permissionJpa = permissionJpa;
    }

    @Transactional(readOnly = true)
    public List<RoleView> listRoles() {
        return roleJpa.findAll().stream().map(RoleView::from).toList();
    }

    @Transactional(readOnly = true)
    public List<PermissionView> listPermissions() {
        return permissionJpa.findAll().stream().map(PermissionView::from).toList();
    }

    @Transactional
    public RoleView setRolePermissions(UUID roleId, Collection<String> permissionCodes) {
        RoleEntity role = roleJpa.findById(roleId)
                .orElseThrow(() -> new NotFoundException("Role not found: " + roleId));
        List<PermissionEntity> permissions = permissionJpa.findByCodeIn(permissionCodes);
        if (permissions.size() != new HashSet<>(permissionCodes).size()) {
            throw new IllegalArgumentException("One or more permission codes are unknown");
        }
        role.setPermissions(new HashSet<>(permissions));
        return RoleView.from(roleJpa.save(role));
    }
}
