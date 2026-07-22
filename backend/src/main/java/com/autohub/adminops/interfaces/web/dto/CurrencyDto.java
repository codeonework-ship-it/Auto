package com.autohub.adminops.interfaces.web.dto;

import com.autohub.adminops.infrastructure.persistence.CurrencyEntity;

public record CurrencyDto(String id, String code, String name, boolean active) {

    public static CurrencyDto from(CurrencyEntity e) {
        return new CurrencyDto(e.getId().toString(), e.getCode(), e.getName(), e.isActive());
    }
}
