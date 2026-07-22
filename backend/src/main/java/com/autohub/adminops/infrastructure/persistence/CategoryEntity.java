package com.autohub.adminops.infrastructure.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "master_categories")
public class CategoryEntity extends NamedMasterEntity {
}
