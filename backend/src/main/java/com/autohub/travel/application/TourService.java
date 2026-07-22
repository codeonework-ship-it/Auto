package com.autohub.travel.application;

import com.autohub.shared.application.HtmlSanitizer;
import com.autohub.shared.application.port.CurrentUser;
import com.autohub.shared.domain.exception.NotFoundException;
import com.autohub.travel.infrastructure.persistence.TourEntity;
import com.autohub.travel.infrastructure.persistence.TourJpaRepository;
import com.autohub.travel.interfaces.web.dto.CreateTourRequest;
import com.autohub.travel.interfaces.web.dto.UpdateTourRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Tour-guide use cases: create/update/list guided tour offers. Rich text is sanitized on write;
 * ownership is checked by {@code guide_id}. Mirrors the catalog service patterns.
 */
@Service
public class TourService {

    private final TourJpaRepository tours;
    private final HtmlSanitizer sanitizer;
    private final CurrentUser currentUser;

    public TourService(TourJpaRepository tours, HtmlSanitizer sanitizer, CurrentUser currentUser) {
        this.tours = tours;
        this.sanitizer = sanitizer;
        this.currentUser = currentUser;
    }

    // ---- commands ----

    @Transactional
    public TourEntity create(CreateTourRequest req) {
        UUID guideId = currentUser.requireUserId();
        TourEntity tour = new TourEntity(
                UUID.randomUUID(), guideId, req.title().trim(), sanitizer.sanitize(req.descriptionHtml()),
                parseUuid(req.categoryId()), trimToNull(req.destination()), req.durationDays(),
                req.priceAmount(), normalizeCurrency(req.currency()));
        return tours.save(tour);
    }

    @Transactional
    public TourEntity update(UUID id, UpdateTourRequest req) {
        TourEntity tour = require(id);
        assertCanModify(tour);
        tour.setTitle(req.title().trim());
        tour.setDescriptionHtml(sanitizer.sanitize(req.descriptionHtml()));
        tour.setCategoryId(parseUuid(req.categoryId()));
        tour.setDestination(trimToNull(req.destination()));
        tour.setDurationDays(req.durationDays());
        tour.setPriceAmount(req.priceAmount());
        tour.setCurrency(normalizeCurrency(req.currency()));
        return tours.save(tour);
    }

    // ---- queries ----

    @Transactional(readOnly = true)
    public List<TourEntity> listAll() {
        return tours.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public TourEntity get(UUID id) {
        return require(id);
    }

    // ---- helpers ----

    private TourEntity require(UUID id) {
        return tours.findById(id).orElseThrow(() -> new NotFoundException("Tour not found: " + id));
    }

    private void assertCanModify(TourEntity tour) {
        try {
            if (tour.getGuideId().equals(currentUser.requireUserId())) {
                return;
            }
        } catch (RuntimeException ignored) {
            // fall through to denial
        }
        throw new AccessDeniedException("You may only modify your own tours");
    }

    private static String normalizeCurrency(String currency) {
        return currency == null || currency.isBlank() ? null : currency.trim().toUpperCase(Locale.ROOT);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static UUID parseUuid(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID: " + value);
        }
    }
}
