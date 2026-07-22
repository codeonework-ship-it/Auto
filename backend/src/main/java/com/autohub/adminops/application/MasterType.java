package com.autohub.adminops.application;

import com.autohub.adminops.infrastructure.persistence.NamedMasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.function.Supplier;

/**
 * Binds a master resource key to its concrete JPA repository and a factory for new rows,
 * so {@link MasterService} can perform CRUD generically across every simple master table.
 */
public final class MasterType {

    private final JpaRepository<NamedMasterEntity, UUID> repository;
    private final Supplier<? extends NamedMasterEntity> factory;

    @SuppressWarnings({"unchecked", "rawtypes"})
    public MasterType(JpaRepository<? extends NamedMasterEntity, UUID> repository,
                      Supplier<? extends NamedMasterEntity> factory) {
        this.repository = (JpaRepository<NamedMasterEntity, UUID>) (JpaRepository) repository;
        this.factory = factory;
    }

    public JpaRepository<NamedMasterEntity, UUID> repository() {
        return repository;
    }

    public NamedMasterEntity newInstance() {
        return factory.get();
    }
}
