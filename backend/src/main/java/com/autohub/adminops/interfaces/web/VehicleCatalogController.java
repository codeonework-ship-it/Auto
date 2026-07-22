package com.autohub.adminops.interfaces.web;

import com.autohub.adminops.application.VehicleCatalogService;
import com.autohub.adminops.interfaces.web.dto.VehicleMakeDto;
import com.autohub.adminops.interfaces.web.dto.VehicleMakeRequest;
import com.autohub.adminops.interfaces.web.dto.VehicleModelDto;
import com.autohub.adminops.interfaces.web.dto.VehicleModelRequest;
import com.autohub.adminops.interfaces.web.dto.VehicleVariantDto;
import com.autohub.adminops.interfaces.web.dto.VehicleVariantRequest;
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
 * Hierarchical vehicle catalog master (make → model → variant). Lives under
 * {@code /api/v1/masters} so GETs are public; writes require {@code master:manage}.
 * Kept separate from the generic {@link MasterController} because these carry parent
 * FKs and composite uniqueness that the single-column master shape cannot express.
 */
@RestController
@RequestMapping("/api/v1/masters")
public class VehicleCatalogController {

    private final VehicleCatalogService service;

    public VehicleCatalogController(VehicleCatalogService service) {
        this.service = service;
    }

    // ---- makes ----

    @GetMapping("/vehicle-makes")
    public ApiResponse<List<VehicleMakeDto>> listMakes() {
        return ApiResponse.ok(service.listMakes());
    }

    @PostMapping("/vehicle-makes")
    @PreAuthorize("hasAuthority('master:manage')")
    public ResponseEntity<ApiResponse<VehicleMakeDto>> createMake(@Valid @RequestBody VehicleMakeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.createMake(request)));
    }

    @PutMapping("/vehicle-makes/{id}")
    @PreAuthorize("hasAuthority('master:manage')")
    public ApiResponse<VehicleMakeDto> updateMake(@PathVariable UUID id,
                                                  @Valid @RequestBody VehicleMakeRequest request) {
        return ApiResponse.ok(service.updateMake(id, request));
    }

    @PatchMapping("/vehicle-makes/{id}/toggle")
    @PreAuthorize("hasAuthority('master:manage')")
    public ApiResponse<VehicleMakeDto> toggleMake(@PathVariable UUID id) {
        return ApiResponse.ok(service.toggleMake(id));
    }

    @DeleteMapping("/vehicle-makes/{id}")
    @PreAuthorize("hasAuthority('master:manage')")
    public ResponseEntity<Void> deleteMake(@PathVariable UUID id) {
        service.deleteMake(id);
        return ResponseEntity.noContent().build();
    }

    // ---- models (children of a make) ----

    @GetMapping("/vehicle-makes/{makeId}/models")
    public ApiResponse<List<VehicleModelDto>> listModels(@PathVariable UUID makeId) {
        return ApiResponse.ok(service.listModels(makeId));
    }

    @PostMapping("/vehicle-models")
    @PreAuthorize("hasAuthority('master:manage')")
    public ResponseEntity<ApiResponse<VehicleModelDto>> createModel(@Valid @RequestBody VehicleModelRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.createModel(request)));
    }

    @PutMapping("/vehicle-models/{id}")
    @PreAuthorize("hasAuthority('master:manage')")
    public ApiResponse<VehicleModelDto> updateModel(@PathVariable UUID id,
                                                    @Valid @RequestBody VehicleModelRequest request) {
        return ApiResponse.ok(service.updateModel(id, request));
    }

    @DeleteMapping("/vehicle-models/{id}")
    @PreAuthorize("hasAuthority('master:manage')")
    public ResponseEntity<Void> deleteModel(@PathVariable UUID id) {
        service.deleteModel(id);
        return ResponseEntity.noContent().build();
    }

    // ---- variants (children of a model) ----

    @GetMapping("/vehicle-models/{modelId}/variants")
    public ApiResponse<List<VehicleVariantDto>> listVariants(@PathVariable UUID modelId) {
        return ApiResponse.ok(service.listVariants(modelId));
    }

    @PostMapping("/vehicle-variants")
    @PreAuthorize("hasAuthority('master:manage')")
    public ResponseEntity<ApiResponse<VehicleVariantDto>> createVariant(@Valid @RequestBody VehicleVariantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.createVariant(request)));
    }

    @PutMapping("/vehicle-variants/{id}")
    @PreAuthorize("hasAuthority('master:manage')")
    public ApiResponse<VehicleVariantDto> updateVariant(@PathVariable UUID id,
                                                        @Valid @RequestBody VehicleVariantRequest request) {
        return ApiResponse.ok(service.updateVariant(id, request));
    }

    @DeleteMapping("/vehicle-variants/{id}")
    @PreAuthorize("hasAuthority('master:manage')")
    public ResponseEntity<Void> deleteVariant(@PathVariable UUID id) {
        service.deleteVariant(id);
        return ResponseEntity.noContent().build();
    }
}
