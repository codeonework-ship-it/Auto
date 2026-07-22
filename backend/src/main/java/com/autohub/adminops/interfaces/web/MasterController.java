package com.autohub.adminops.interfaces.web;

import com.autohub.adminops.application.MasterService;
import com.autohub.adminops.interfaces.web.dto.MasterDto;
import com.autohub.adminops.interfaces.web.dto.MasterRequest;
import com.autohub.shared.interfaces.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Generic master (reference data) CRUD used by the control-panel. Reads are public; writes
 * require the {@code master:manage} permission. {@code {resource}} is one of the registered
 * keys, e.g. {@code fuel-types}, {@code body-types}, {@code categories}.
 */
@RestController
@RequestMapping("/api/v1/masters")
public class MasterController {

    private final MasterService masterService;

    public MasterController(MasterService masterService) {
        this.masterService = masterService;
    }

    @GetMapping
    public ApiResponse<List<String>> resources() {
        return ApiResponse.ok(masterService.resources());
    }

    @GetMapping("/{resource}")
    public ApiResponse<List<MasterDto>> list(@PathVariable String resource) {
        return ApiResponse.ok(masterService.list(resource));
    }

    @PostMapping("/{resource}")
    @PreAuthorize("hasAuthority('master:manage')")
    public ResponseEntity<ApiResponse<MasterDto>> create(@PathVariable String resource,
                                                         @Valid @RequestBody MasterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(masterService.create(resource, request)));
    }

    @PutMapping("/{resource}/{id}")
    @PreAuthorize("hasAuthority('master:manage')")
    public ApiResponse<MasterDto> update(@PathVariable String resource,
                                         @PathVariable UUID id,
                                         @Valid @RequestBody MasterRequest request) {
        return ApiResponse.ok(masterService.update(resource, id, request));
    }

    @PatchMapping("/{resource}/{id}/toggle")
    @PreAuthorize("hasAuthority('master:manage')")
    public ApiResponse<MasterDto> toggle(@PathVariable String resource, @PathVariable UUID id) {
        return ApiResponse.ok(masterService.toggle(resource, id));
    }

    @DeleteMapping("/{resource}/{id}")
    @PreAuthorize("hasAuthority('master:manage')")
    public ResponseEntity<Void> delete(@PathVariable String resource, @PathVariable UUID id) {
        masterService.delete(resource, id);
        return ResponseEntity.noContent().build();
    }
}
