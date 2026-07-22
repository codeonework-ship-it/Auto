package com.autohub.adminops.application;

import java.util.List;
import java.util.Map;

/**
 * Holder for the master-resource-key → {@link MasterType} mapping. A dedicated type (rather than
 * injecting a raw {@code Map}) avoids Spring's "collect all beans of type" autowiring semantics.
 */
public class MasterRegistry {

    private final Map<String, MasterType> types;

    public MasterRegistry(Map<String, MasterType> types) {
        this.types = types;
    }

    public MasterType get(String resource) {
        return types.get(resource);
    }

    public List<String> keys() {
        return types.keySet().stream().sorted().toList();
    }
}
