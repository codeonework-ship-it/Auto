package com.autohub.adminops.infrastructure.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "master_transmissions")
public class TransmissionEntity extends NamedMasterEntity {
}
