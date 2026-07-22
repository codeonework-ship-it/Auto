package com.autohub.adminops.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * Vehicle make (brand) — maps the existing V1 {@code vehicle_makes} table. Unlike the simple
 * name/active masters it carries a {@code kind} discriminator (CAR | BIKE | BOTH), so it lives
 * outside the generic {@link NamedMasterEntity} family.
 */
@Entity
@Table(name = "vehicle_makes")
public class VehicleMakeEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 80)
    private String name;

    @Column(nullable = false, length = 10)
    private String kind; // CAR | BIKE | BOTH

    @Column(nullable = false)
    private boolean active = true;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
