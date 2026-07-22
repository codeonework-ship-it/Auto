package com.autohub.adminops.infrastructure.config;

import com.autohub.adminops.application.MasterRegistry;
import com.autohub.adminops.application.MasterType;
import com.autohub.adminops.infrastructure.persistence.BodyTypeEntity;
import com.autohub.adminops.infrastructure.persistence.BodyTypeRepository;
import com.autohub.adminops.infrastructure.persistence.CategoryEntity;
import com.autohub.adminops.infrastructure.persistence.CategoryRepository;
import com.autohub.adminops.infrastructure.persistence.FuelTypeEntity;
import com.autohub.adminops.infrastructure.persistence.FuelTypeRepository;
import com.autohub.adminops.infrastructure.persistence.ReportReasonEntity;
import com.autohub.adminops.infrastructure.persistence.ReportReasonRepository;
import com.autohub.adminops.infrastructure.persistence.ReviewTagEntity;
import com.autohub.adminops.infrastructure.persistence.ReviewTagRepository;
import com.autohub.adminops.infrastructure.persistence.TourCategoryEntity;
import com.autohub.adminops.infrastructure.persistence.TourCategoryRepository;
import com.autohub.adminops.infrastructure.persistence.TransmissionEntity;
import com.autohub.adminops.infrastructure.persistence.TransmissionRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Registers every simple master resource key (as used by the control-panel and REST paths)
 * against its repository + row factory. Add a master here and it is instantly CRUD-able via
 * {@code /api/v1/masters/{key}} — no new service or controller code.
 */
@Configuration
public class MasterRegistryConfig {

    @Bean
    public MasterRegistry masterRegistry(
            FuelTypeRepository fuelTypes,
            BodyTypeRepository bodyTypes,
            TransmissionRepository transmissions,
            CategoryRepository categories,
            TourCategoryRepository tourCategories,
            ReviewTagRepository reviewTags,
            ReportReasonRepository reportReasons) {

        Map<String, MasterType> registry = new LinkedHashMap<>();
        registry.put("fuel-types", new MasterType(fuelTypes, FuelTypeEntity::new));
        registry.put("body-types", new MasterType(bodyTypes, BodyTypeEntity::new));
        registry.put("transmissions", new MasterType(transmissions, TransmissionEntity::new));
        registry.put("categories", new MasterType(categories, CategoryEntity::new));
        registry.put("tour-categories", new MasterType(tourCategories, TourCategoryEntity::new));
        registry.put("review-tags", new MasterType(reviewTags, ReviewTagEntity::new));
        registry.put("report-reasons", new MasterType(reportReasons, ReportReasonEntity::new));
        return new MasterRegistry(registry);
    }
}
