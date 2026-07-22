package com.autohub.adminops.interfaces.web;

import com.autohub.adminops.application.CurrencyService;
import com.autohub.adminops.interfaces.web.dto.CurrencyDto;
import com.autohub.adminops.interfaces.web.dto.CurrencyRequest;
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
 * Currency master. Under {@code /api/v1/masters} so GET is public; writes require
 * {@code master:manage}. Separate from the generic master because the unique key is the
 * 3-char {@code code} rather than {@code name}.
 */
@RestController
@RequestMapping("/api/v1/masters/currencies")
public class CurrencyController {

    private final CurrencyService service;

    public CurrencyController(CurrencyService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<CurrencyDto>> list() {
        return ApiResponse.ok(service.list());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('master:manage')")
    public ResponseEntity<ApiResponse<CurrencyDto>> create(@Valid @RequestBody CurrencyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('master:manage')")
    public ApiResponse<CurrencyDto> update(@PathVariable UUID id, @Valid @RequestBody CurrencyRequest request) {
        return ApiResponse.ok(service.update(id, request));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('master:manage')")
    public ApiResponse<CurrencyDto> toggle(@PathVariable UUID id) {
        return ApiResponse.ok(service.toggle(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('master:manage')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
