package com.autohub.identity.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "permissions")
public class PermissionEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column
    private String description;

    protected PermissionEntity() { }

    public UUID getId() { return id; }
    public String getCode() { return code; }
    public String getDescription() { return description; }
}
