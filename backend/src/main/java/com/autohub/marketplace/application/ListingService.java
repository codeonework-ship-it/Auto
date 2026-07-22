package com.autohub.marketplace.application;

import com.autohub.marketplace.domain.event.ListingCreatedEvent;
import com.autohub.marketplace.domain.model.ListingStatus;
import com.autohub.marketplace.infrastructure.persistence.ListingEntity;
import com.autohub.marketplace.infrastructure.persistence.ListingJpaRepository;
import com.autohub.marketplace.interfaces.web.dto.CreateListingRequest;
import com.autohub.marketplace.interfaces.web.dto.UpdateListingRequest;
import com.autohub.shared.application.HtmlSanitizer;
import com.autohub.shared.application.port.CurrentUser;
import com.autohub.shared.application.port.DomainEventPublisher;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Marketplace use cases: create/update listings, moderator approve/reject, and the visibility
 * rules for public reads. Rich text is sanitized on write; creating a listing emits
 * {@code marketplace.listing.created} via the Outbox.
 */
@Service
public class ListingService {

    private final ListingJpaRepository listings;
    private final HtmlSanitizer sanitizer;
    private final CurrentUser currentUser;
    private final DomainEventPublisher events;

    public ListingService(ListingJpaRepository listings, HtmlSanitizer sanitizer,
                          CurrentUser currentUser, DomainEventPublisher events) {
        this.listings = listings;
        this.sanitizer = sanitizer;
        this.currentUser = currentUser;
        this.events = events;
    }

    // ---- commands ----

    @Transactional
    public ListingEntity create(CreateListingRequest req) {
        UUID sellerId = currentUser.requireUserId();
        ListingEntity listing = new ListingEntity(
                UUID.randomUUID(), sellerId, parseUuid(req.postId()), req.title().trim(),
                sanitizer.sanitize(req.descriptionHtml()), req.priceAmount(),
                normalizeCurrency(req.currency()), parseUuid(req.cityId()),
                ListingStatus.PENDING_REVIEW.name());
        ListingEntity saved = listings.save(listing);
        events.publish(new ListingCreatedEvent(
                saved.getId().toString(), saved.getTitle(),
                saved.getSellerId().toString(), Instant.now()));
        return saved;
    }

    @Transactional
    public ListingEntity update(UUID id, UpdateListingRequest req) {
        ListingEntity listing = require(id);
        assertCanModify(listing);
        listing.setTitle(req.title().trim());
        listing.setDescriptionHtml(sanitizer.sanitize(req.descriptionHtml()));
        listing.setPriceAmount(req.priceAmount());
        listing.setCurrency(normalizeCurrency(req.currency()));
        listing.setPostId(parseUuid(req.postId()));
        listing.setCityId(parseUuid(req.cityId()));
        listing.touch();
        return listings.save(listing);
    }

    @Transactional
    public ListingEntity approve(UUID id) {
        ListingEntity listing = require(id);
        listing.setStatus(ListingStatus.ACTIVE.name());
        listing.touch();
        return listings.save(listing);
    }

    @Transactional
    public ListingEntity reject(UUID id, String reason) {
        ListingEntity listing = require(id);
        listing.setStatus(ListingStatus.REJECTED.name());
        listing.touch();
        return listings.save(listing);
    }

    // ---- queries ----

    @Transactional(readOnly = true)
    public List<ListingEntity> listActive() {
        return listings.findByStatusOrderByUpdatedAtDesc(ListingStatus.ACTIVE.name());
    }

    @Transactional(readOnly = true)
    public List<ListingEntity> listMine() {
        return listings.findBySellerIdOrderByUpdatedAtDesc(currentUser.requireUserId());
    }

    @Transactional(readOnly = true)
    public ListingEntity getVisible(UUID id) {
        ListingEntity listing = require(id);
        if (!ListingStatus.ACTIVE.name().equals(listing.getStatus()) && !canModifySilently(listing)) {
            throw new NotFoundException("Listing not found: " + id);  // hide non-active from others
        }
        return listing;
    }

    // ---- helpers ----

    ListingEntity require(UUID id) {
        return listings.findById(id).orElseThrow(() -> new NotFoundException("Listing not found: " + id));
    }

    private void assertCanModify(ListingEntity listing) {
        if (!canModifySilently(listing)) {
            throw new AccessDeniedException("You may only modify your own listings");
        }
    }

    private boolean canModifySilently(ListingEntity listing) {
        try {
            return listing.getSellerId().equals(currentUser.requireUserId())
                    || currentUser.hasPermission("listing:approve");
        } catch (RuntimeException unauthenticated) {
            return false;
        }
    }

    private static String normalizeCurrency(String currency) {
        return currency == null || currency.isBlank() ? null : currency.trim().toUpperCase(Locale.ROOT);
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
