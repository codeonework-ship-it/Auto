package com.autohub.adminops.infrastructure.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "master_review_tags")
public class ReviewTagEntity extends NamedMasterEntity {
}
