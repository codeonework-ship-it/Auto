package com.autohub.adminops.interfaces.web;

import com.autohub.adminops.application.CityService;
import com.autohub.adminops.interfaces.web.dto.CityDto;
import com.autohub.adminops.interfaces.web.dto.CityRequest;
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
 * City / location master. Under {@code /api/v1/masters} so GET is public; writes require
 * {@code master:manage}. Separate from the generic master because of the {@code country}
 * column and composite UNIQUE(name, country).
 */
@RestController
@RequestMapping("/api/v1/masters/cities")
public class CityController {

    private final CityService service;

    public CityController(CityService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<CityDto>> list() {
        return ApiResponse.ok(service.list());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('master:manage')")
    public ResponseEntity<ApiResponse<CityDto>> create(@Valid @RequestBody CityRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('master:manage')")
    public ApiResponse<CityDto> update(@PathVariable UUID id, @Valid @RequestBody CityRequest request) {
        return ApiResponse.ok(service.update(id, request));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('master:manage')")
    public ApiResponse<CityDto> toggle(@PathVariable UUID id) {
        return ApiResponse.ok(service.toggle(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('master:manage')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
