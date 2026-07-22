package com.autohub.adminops.application;

import com.autohub.adminops.infrastructure.persistence.VehicleMakeEntity;
import com.autohub.adminops.infrastructure.persistence.VehicleMakeRepository;
import com.autohub.adminops.infrastructure.persistence.VehicleModelEntity;
import com.autohub.adminops.infrastructure.persistence.VehicleModelRepository;
import com.autohub.adminops.infrastructure.persistence.VehicleVariantEntity;
import com.autohub.adminops.infrastructure.persistence.VehicleVariantRepository;
import com.autohub.adminops.interfaces.web.dto.VehicleMakeDto;
import com.autohub.adminops.interfaces.web.dto.VehicleMakeRequest;
import com.autohub.adminops.interfaces.web.dto.VehicleModelDto;
import com.autohub.adminops.interfaces.web.dto.VehicleModelRequest;
import com.autohub.adminops.interfaces.web.dto.VehicleVariantDto;
import com.autohub.adminops.interfaces.web.dto.VehicleVariantRequest;
import com.autohub.shared.domain.exception.ConflictException;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * CRUD for the hierarchical vehicle catalog: make → model → variant. These carry parent FKs and
 * composite uniqueness, so they sit outside the generic {@link MasterService}. Reads are public
 * (paths live under {@code /api/v1/masters}); writes require {@code master:manage}.
 */
@Service
public class VehicleCatalogService {

    private final VehicleMakeRepository makes;
    private final VehicleModelRepository models;
    private final VehicleVariantRepository variants;

    public VehicleCatalogService(VehicleMakeRepository makes,
                                 VehicleModelRepository models,
                                 VehicleVariantRepository variants) {
        this.makes = makes;
        this.models = models;
        this.variants = variants;
    }

    // ---- makes ----

    @Transactional(readOnly = true)
    public List<VehicleMakeDto> listMakes() {
        return makes.findAllByOrderByNameAsc().stream().map(VehicleMakeDto::from).toList();
    }

    @Transactional
    public VehicleMakeDto createMake(VehicleMakeRequest request) {
        String name = request.name().trim();
        if (makes.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Make already exists: " + name);
        }
        VehicleMakeEntity e = new VehicleMakeEntity();
        e.setId(UUID.randomUUID());
        e.setName(name);
        e.setKind(request.kind());
        e.setActive(request.activeOrDefault());
        return VehicleMakeDto.from(makes.save(e));
    }

    @Transactional
    public VehicleMakeDto updateMake(UUID id, VehicleMakeRequest request) {
        VehicleMakeEntity e = makes.findById(id)
                .orElseThrow(() -> new NotFoundException("Make not found: " + id));
        String name = request.name().trim();
        if (makes.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ConflictException("Make already exists: " + name);
        }
        e.setName(name);
        e.setKind(request.kind());
        e.setActive(request.activeOrDefault());
        return VehicleMakeDto.from(makes.save(e));
    }

    @Transactional
    public VehicleMakeDto toggleMake(UUID id) {
        VehicleMakeEntity e = makes.findById(id)
                .orElseThrow(() -> new NotFoundException("Make not found: " + id));
        e.setActive(!e.isActive());
        return VehicleMakeDto.from(makes.save(e));
    }

    @Transactional
    public void deleteMake(UUID id) {
        if (!makes.existsById(id)) {
            throw new NotFoundException("Make not found: " + id);
        }
        if (models.existsByMakeId(id)) {
            throw new ConflictException("Cannot delete a make that still has models.");
        }
        makes.deleteById(id);
    }

    // ---- models ----

    @Transactional(readOnly = true)
    public List<VehicleModelDto> listModels(UUID makeId) {
        if (!makes.existsById(makeId)) {
            throw new NotFoundException("Make not found: " + makeId);
        }
        return models.findByMakeIdOrderByNameAsc(makeId).stream().map(VehicleModelDto::from).toList();
    }

    @Transactional
    public VehicleModelDto createModel(VehicleModelRequest request) {
        if (!makes.existsById(request.makeId())) {
            throw new NotFoundException("Make not found: " + request.makeId());
        }
        String name = request.name().trim();
        if (models.existsByMakeIdAndNameIgnoreCase(request.makeId(), name)) {
            throw new ConflictException("Model already exists for this make: " + name);
        }
        VehicleModelEntity e = new VehicleModelEntity();
        e.setId(UUID.randomUUID());
        e.setMakeId(request.makeId());
        e.setName(name);
        e.setActive(request.activeOrDefault());
        return VehicleModelDto.from(models.save(e));
    }

    @Transactional
    public VehicleModelDto updateModel(UUID id, VehicleModelRequest request) {
        VehicleModelEntity e = models.findById(id)
                .orElseThrow(() -> new NotFoundException("Model not found: " + id));
        if (!makes.existsById(request.makeId())) {
            throw new NotFoundException("Make not found: " + request.makeId());
        }
        String name = request.name().trim();
        if (models.existsByMakeIdAndNameIgnoreCaseAndIdNot(request.makeId(), name, id)) {
            throw new ConflictException("Model already exists for this make: " + name);
        }
        e.setMakeId(request.makeId());
        e.setName(name);
        e.setActive(request.activeOrDefault());
        return VehicleModelDto.from(models.save(e));
    }

    @Transactional
    public void deleteModel(UUID id) {
        if (!models.existsById(id)) {
            throw new NotFoundException("Model not found: " + id);
        }
        if (variants.existsByModelId(id)) {
            throw new ConflictException("Cannot delete a model that still has variants.");
        }
        models.deleteById(id);
    }

    // ---- variants ----

    @Transactional(readOnly = true)
    public List<VehicleVariantDto> listVariants(UUID modelId) {
        if (!models.existsById(modelId)) {
            throw new NotFoundException("Model not found: " + modelId);
        }
        return variants.findByModelIdOrderByNameAsc(modelId).stream().map(VehicleVariantDto::from).toList();
    }

    @Transactional
    public VehicleVariantDto createVariant(VehicleVariantRequest request) {
        if (!models.existsById(request.modelId())) {
            throw new NotFoundException("Model not found: " + request.modelId());
        }
        String name = request.name().trim();
        if (variants.existsByModelIdAndNameIgnoreCase(request.modelId(), name)) {
            throw new ConflictException("Variant already exists for this model: " + name);
        }
        VehicleVariantEntity e = new VehicleVariantEntity();
        e.setId(UUID.randomUUID());
        e.setModelId(request.modelId());
        e.setName(name);
        e.setActive(request.activeOrDefault());
        return VehicleVariantDto.from(variants.save(e));
    }

    @Transactional
    public VehicleVariantDto updateVariant(UUID id, VehicleVariantRequest request) {
        VehicleVariantEntity e = variants.findById(id)
                .orElseThrow(() -> new NotFoundException("Variant not found: " + id));
        if (!models.existsById(request.modelId())) {
            throw new NotFoundException("Model not found: " + request.modelId());
        }
        String name = request.name().trim();
        if (variants.existsByModelIdAndNameIgnoreCaseAndIdNot(request.modelId(), name, id)) {
            throw new ConflictException("Variant already exists for this model: " + name);
        }
        e.setModelId(request.modelId());
        e.setName(name);
        e.setActive(request.activeOrDefault());
        return VehicleVariantDto.from(variants.save(e));
    }

    @Transactional
    public void deleteVariant(UUID id) {
        if (!variants.existsById(id)) {
            throw new NotFoundException("Variant not found: " + id);
        }
        variants.deleteById(id);
    }
}
