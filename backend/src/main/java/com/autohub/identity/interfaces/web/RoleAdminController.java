package com.autohub.identity.interfaces.web;

import com.autohub.identity.application.RoleAdminService;
import com.autohub.identity.interfaces.web.dto.PermissionView;
import com.autohub.identity.interfaces.web.dto.RoleView;
import com.autohub.identity.interfaces.web.dto.SetPermissionsRequest;
import com.autohub.shared.interfaces.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/** Roles & permissions administration (control-panel). Guarded by {@code role:manage}. */
@RestController
@RequestMapping("/api/v1")
@PreAuthorize("hasAuthority('role:manage')")
public class RoleAdminController {

    private final RoleAdminService roleAdminService;

    public RoleAdminController(RoleAdminService roleAdminService) {
        this.roleAdminService = roleAdminService;
    }

    @GetMapping("/roles")
    public ApiResponse<List<RoleView>> roles() {
        return ApiResponse.ok(roleAdminService.listRoles());
    }

    @GetMapping("/permissions")
    public ApiResponse<List<PermissionView>> permissions() {
        return ApiResponse.ok(roleAdminService.listPermissions());
    }

    @PutMapping("/roles/{roleId}/permissions")
    public ApiResponse<RoleView> setRolePermissions(@PathVariable UUID roleId,
                                                    @Valid @RequestBody SetPermissionsRequest request) {
        return ApiResponse.ok(roleAdminService.setRolePermissions(roleId, request.permissionCodes()));
    }
}
