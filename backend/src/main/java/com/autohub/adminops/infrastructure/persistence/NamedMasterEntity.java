package com.autohub.adminops.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

import java.util.UUID;

/**
 * Shared shape for the simple single-column master tables ({@code id, name, active}).
 * Concrete subclasses only bind a {@code @Table}; all CRUD is handled generically by
 * {@link com.autohub.adminops.application.MasterService}.
 */
@MappedSuperclass
public abstract class NamedMasterEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private boolean active = true;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
