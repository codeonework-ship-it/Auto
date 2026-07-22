package com.autohub.adminops.application;

import com.autohub.adminops.infrastructure.persistence.CityEntity;
import com.autohub.adminops.infrastructure.persistence.CityRepository;
import com.autohub.adminops.interfaces.web.dto.CityDto;
import com.autohub.adminops.interfaces.web.dto.CityRequest;
import com.autohub.shared.domain.exception.ConflictException;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * CRUD for the {@code master_cities} table ({@code id, name, country, active}), whose extra
 * {@code country} column and composite UNIQUE(name, country) keep it out of the generic master.
 */
@Service
public class CityService {

    private final CityRepository cities;

    public CityService(CityRepository cities) {
        this.cities = cities;
    }

    @Transactional(readOnly = true)
    public List<CityDto> list() {
        return cities.findAllByOrderByNameAsc().stream().map(CityDto::from).toList();
    }

    @Transactional
    public CityDto create(CityRequest request) {
        String name = request.name().trim();
        String country = country(request);
        if (cities.existsByNameIgnoreCaseAndCountryIgnoreCase(name, country)) {
            throw new ConflictException("City already exists: " + name + ", " + country);
        }
        CityEntity e = new CityEntity();
        e.setId(UUID.randomUUID());
        e.setName(name);
        e.setCountry(country);
        e.setActive(request.activeOrDefault());
        return CityDto.from(cities.save(e));
    }

    @Transactional
    public CityDto update(UUID id, CityRequest request) {
        CityEntity e = cities.findById(id)
                .orElseThrow(() -> new NotFoundException("City not found: " + id));
        String name = request.name().trim();
        String country = country(request);
        if (cities.existsByNameIgnoreCaseAndCountryIgnoreCaseAndIdNot(name, country, id)) {
            throw new ConflictException("City already exists: " + name + ", " + country);
        }
        e.setName(name);
        e.setCountry(country);
        e.setActive(request.activeOrDefault());
        return CityDto.from(cities.save(e));
    }

    @Transactional
    public CityDto toggle(UUID id) {
        CityEntity e = cities.findById(id)
                .orElseThrow(() -> new NotFoundException("City not found: " + id));
        e.setActive(!e.isActive());
        return CityDto.from(cities.save(e));
    }

    @Transactional
    public void delete(UUID id) {
        if (!cities.existsById(id)) {
            throw new NotFoundException("City not found: " + id);
        }
        cities.deleteById(id);
    }

    private static String country(CityRequest request) {
        return request.country() == null ? "" : request.country().trim();
    }
}
