package com.autohub.adminops.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.util.UUID;

/**
 * Vehicle model belonging to a make — maps the existing V1 {@code vehicle_models} table
 * ({@code id, make_id, name, active}) with a UNIQUE(make_id, name) constraint.
 */
@Entity
@Table(name = "vehicle_models",
        uniqueConstraints = @UniqueConstraint(columnNames = {"make_id", "name"}))
public class VehicleModelEntity {

    @Id
    private UUID id;

    @Column(name = "make_id", nullable = false)
    private UUID makeId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    private boolean active = true;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getMakeId() { return makeId; }
    public void setMakeId(UUID makeId) { this.makeId = makeId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
