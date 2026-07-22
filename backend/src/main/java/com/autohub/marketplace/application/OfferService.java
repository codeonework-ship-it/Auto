package com.autohub.marketplace.application;

import com.autohub.marketplace.domain.model.OfferStatus;
import com.autohub.marketplace.infrastructure.persistence.ListingEntity;
import com.autohub.marketplace.infrastructure.persistence.OfferEntity;
import com.autohub.marketplace.infrastructure.persistence.OfferJpaRepository;
import com.autohub.marketplace.interfaces.web.dto.CreateOfferRequest;
import com.autohub.shared.application.HtmlSanitizer;
import com.autohub.shared.application.port.CurrentUser;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Offer use cases: a buyer makes an offer on a listing; only the listing owner (or a moderator
 * holding {@code listing:approve}) may read the offers on it.
 */
@Service
public class OfferService {

    private final OfferJpaRepository offers;
    private final ListingService listings;
    private final HtmlSanitizer sanitizer;
    private final CurrentUser currentUser;

    public OfferService(OfferJpaRepository offers, ListingService listings, HtmlSanitizer sanitizer,
                        CurrentUser currentUser) {
        this.offers = offers;
        this.listings = listings;
        this.sanitizer = sanitizer;
        this.currentUser = currentUser;
    }

    @Transactional
    public OfferEntity makeOffer(UUID listingId, CreateOfferRequest req) {
        ListingEntity listing = listings.require(listingId);
        UUID buyerId = currentUser.requireUserId();
        OfferEntity offer = new OfferEntity(
                UUID.randomUUID(), listing.getId(), buyerId, req.amount(),
                sanitizer.sanitize(req.message()), OfferStatus.OPEN.name());
        return offers.save(offer);
    }

    @Transactional(readOnly = true)
    public List<OfferEntity> listForListing(UUID listingId) {
        ListingEntity listing = listings.require(listingId);
        if (!canViewOffers(listing)) {
            throw new AccessDeniedException("Only the listing owner may view its offers");
        }
        return offers.findByListingIdOrderByCreatedAtDesc(listingId);
    }

    private boolean canViewOffers(ListingEntity listing) {
        return listing.getSellerId().equals(currentUser.requireUserId())
                || currentUser.hasPermission("listing:approve");
    }
}
