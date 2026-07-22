package com.autohub.adminops.infrastructure.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "master_report_reasons")
public class ReportReasonEntity extends NamedMasterEntity {
}
