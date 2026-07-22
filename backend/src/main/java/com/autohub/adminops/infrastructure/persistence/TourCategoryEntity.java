package com.autohub.adminops.infrastructure.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "master_tour_categories")
public class TourCategoryEntity extends NamedMasterEntity {
}
