package com.autohub.adminops.application;

import com.autohub.adminops.infrastructure.persistence.NamedMasterEntity;
import com.autohub.adminops.interfaces.web.dto.MasterDto;
import com.autohub.adminops.interfaces.web.dto.MasterRequest;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Generic CRUD for all simple ({@code id, name, active}) master tables. The concrete table is
 * chosen by the {@code resource} key via the {@link MasterType} registry, so one service and
 * one controller serve every master — matching the control-panel's generic Masters screen.
 */
@Service
public class MasterService {

    private final MasterRegistry registry;

    public MasterService(MasterRegistry registry) {
        this.registry = registry;
    }

    public List<String> resources() {
        return registry.keys();
    }

    @Transactional(readOnly = true)
    public List<MasterDto> list(String resource) {
        return type(resource).repository().findAll().stream()
                .map(MasterDto::from)
                .toList();
    }

    @Transactional
    public MasterDto create(String resource, MasterRequest request) {
        MasterType type = type(resource);
        NamedMasterEntity entity = type.newInstance();
        entity.setId(UUID.randomUUID());
        entity.setName(request.name().trim());
        entity.setActive(request.activeOrDefault());
        return MasterDto.from(type.repository().save(entity));
    }

    @Transactional
    public MasterDto update(String resource, UUID id, MasterRequest request) {
        MasterType type = type(resource);
        NamedMasterEntity entity = type.repository().findById(id)
                .orElseThrow(() -> new NotFoundException("Master '" + resource + "' item not found: " + id));
        entity.setName(request.name().trim());
        entity.setActive(request.activeOrDefault());
        return MasterDto.from(type.repository().save(entity));
    }

    @Transactional
    public MasterDto toggle(String resource, UUID id) {
        MasterType type = type(resource);
        NamedMasterEntity entity = type.repository().findById(id)
                .orElseThrow(() -> new NotFoundException("Master '" + resource + "' item not found: " + id));
        entity.setActive(!entity.isActive());
        return MasterDto.from(type.repository().save(entity));
    }

    @Transactional
    public void delete(String resource, UUID id) {
        MasterType type = type(resource);
        if (!type.repository().existsById(id)) {
            throw new NotFoundException("Master '" + resource + "' item not found: " + id);
        }
        type.repository().deleteById(id);
    }

    private MasterType type(String resource) {
        MasterType type = registry.get(resource);
        if (type == null) {  // unknown resource key
            throw new NotFoundException("Unknown master resource: " + resource);
        }
        return type;
    }
}
