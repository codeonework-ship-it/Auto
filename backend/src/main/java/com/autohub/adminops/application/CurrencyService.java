package com.autohub.adminops.application;

import com.autohub.adminops.infrastructure.persistence.CurrencyEntity;
import com.autohub.adminops.infrastructure.persistence.CurrencyRepository;
import com.autohub.adminops.interfaces.web.dto.CurrencyDto;
import com.autohub.adminops.interfaces.web.dto.CurrencyRequest;
import com.autohub.shared.domain.exception.ConflictException;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * CRUD for the {@code master_currencies} table ({@code id, code, name, active}). The 3-char
 * ISO {@code code} column (rather than {@code name}) is the unique key, so it is handled here
 * rather than by the generic master service. Codes are normalised to upper case.
 */
@Service
public class CurrencyService {

    private final CurrencyRepository currencies;

    public CurrencyService(CurrencyRepository currencies) {
        this.currencies = currencies;
    }

    @Transactional(readOnly = true)
    public List<CurrencyDto> list() {
        return currencies.findAllByOrderByCodeAsc().stream().map(CurrencyDto::from).toList();
    }

    @Transactional
    public CurrencyDto create(CurrencyRequest request) {
        String code = request.code().trim().toUpperCase();
        if (currencies.existsByCodeIgnoreCase(code)) {
            throw new ConflictException("Currency already exists: " + code);
        }
        CurrencyEntity e = new CurrencyEntity();
        e.setId(UUID.randomUUID());
        e.setCode(code);
        e.setName(request.name().trim());
        e.setActive(request.activeOrDefault());
        return CurrencyDto.from(currencies.save(e));
    }

    @Transactional
    public CurrencyDto update(UUID id, CurrencyRequest request) {
        CurrencyEntity e = currencies.findById(id)
                .orElseThrow(() -> new NotFoundException("Currency not found: " + id));
        String code = request.code().trim().toUpperCase();
        if (currencies.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new ConflictException("Currency already exists: " + code);
        }
        e.setCode(code);
        e.setName(request.name().trim());
        e.setActive(request.activeOrDefault());
        return CurrencyDto.from(currencies.save(e));
    }

    @Transactional
    public CurrencyDto toggle(UUID id) {
        CurrencyEntity e = currencies.findById(id)
                .orElseThrow(() -> new NotFoundException("Currency not found: " + id));
        e.setActive(!e.isActive());
        return CurrencyDto.from(currencies.save(e));
    }

    @Transactional
    public void delete(UUID id) {
        if (!currencies.existsById(id)) {
            throw new NotFoundException("Currency not found: " + id);
        }
        currencies.deleteById(id);
    }
}
