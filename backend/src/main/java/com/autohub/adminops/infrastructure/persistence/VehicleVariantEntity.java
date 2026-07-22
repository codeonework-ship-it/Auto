package com.autohub.adminops.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.util.UUID;

/**
 * Vehicle variant (trim) belonging to a model — maps the existing V1 {@code vehicle_variants}
 * table ({@code id, model_id, name, active}) with a UNIQUE(model_id, name) constraint.
 */
@Entity
@Table(name = "vehicle_variants",
        uniqueConstraints = @UniqueConstraint(columnNames = {"model_id", "name"}))
public class VehicleVariantEntity {

    @Id
    private UUID id;

    @Column(name = "model_id", nullable = false)
    private UUID modelId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    private boolean active = true;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getModelId() { return modelId; }
    public void setModelId(UUID modelId) { this.modelId = modelId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
