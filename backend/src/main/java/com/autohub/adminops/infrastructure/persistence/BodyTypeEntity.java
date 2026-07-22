package com.autohub.adminops.infrastructure.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "master_body_types")
public class BodyTypeEntity extends NamedMasterEntity {
}
