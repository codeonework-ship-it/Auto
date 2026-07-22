package com.autohub.marketplace.interfaces.web;

import com.autohub.marketplace.application.ListingService;
import com.autohub.marketplace.application.OfferService;
import com.autohub.marketplace.infrastructure.persistence.ListingEntity;
import com.autohub.marketplace.infrastructure.persistence.OfferEntity;
import com.autohub.marketplace.interfaces.web.dto.CreateListingRequest;
import com.autohub.marketplace.interfaces.web.dto.CreateOfferRequest;
import com.autohub.marketplace.interfaces.web.dto.ListingResponse;
import com.autohub.marketplace.interfaces.web.dto.ListingSummaryResponse;
import com.autohub.marketplace.interfaces.web.dto.OfferResponse;
import com.autohub.marketplace.interfaces.web.dto.RejectListingRequest;
import com.autohub.marketplace.interfaces.web.dto.UpdateListingRequest;
import com.autohub.shared.interfaces.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Marketplace (buy/sell listings) web adapter. Reads of active listings are public; creating,
 * updating and making offers are permission-gated and ownership-checked in the service, while
 * approve/reject are moderator-only.
 */
@RestController
@RequestMapping("/api/v1/marketplace/listings")
public class ListingController {

    private final ListingService listingService;
    private final OfferService offerService;

    public ListingController(ListingService listingService, OfferService offerService) {
        this.listingService = listingService;
        this.offerService = offerService;
    }

    // ---- reads ----

    @GetMapping
    public ApiResponse<List<ListingSummaryResponse>> list() {
        return ApiResponse.ok(listingService.listActive().stream().map(ListingSummaryResponse::of).toList());
    }

    @GetMapping("/mine")
    public ApiResponse<List<ListingSummaryResponse>> mine() {
        return ApiResponse.ok(listingService.listMine().stream().map(ListingSummaryResponse::of).toList());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('listing:approve')")
    public ApiResponse<List<ListingSummaryResponse>> pending() {
        return ApiResponse.ok(listingService.listPending().stream().map(ListingSummaryResponse::of).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<ListingResponse> detail(@PathVariable UUID id) {
        return ApiResponse.ok(ListingResponse.from(listingService.getVisible(id)));
    }

    @GetMapping("/{id}/offers")
    public ApiResponse<List<OfferResponse>> offers(@PathVariable UUID id) {
        return ApiResponse.ok(offerService.listForListing(id).stream().map(OfferResponse::from).toList());
    }

    // ---- writes ----

    @PostMapping
    @PreAuthorize("hasAuthority('listing:create')")
    public ResponseEntity<ApiResponse<ListingResponse>> create(@Valid @RequestBody CreateListingRequest request) {
        ListingEntity listing = listingService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(ListingResponse.from(listing)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('listing:create')")
    public ApiResponse<ListingResponse> update(@PathVariable UUID id,
                                               @Valid @RequestBody UpdateListingRequest request) {
        return ApiResponse.ok(ListingResponse.from(listingService.update(id, request)));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('listing:approve')")
    public ApiResponse<ListingResponse> approve(@PathVariable UUID id) {
        return ApiResponse.ok(ListingResponse.from(listingService.approve(id)));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('listing:approve')")
    public ApiResponse<ListingResponse> reject(@PathVariable UUID id,
                                              @RequestBody(required = false) RejectListingRequest request) {
        String reason = request == null ? null : request.reason();
        return ApiResponse.ok(ListingResponse.from(listingService.reject(id, reason)));
    }

    @PostMapping("/{id}/offers")
    @PreAuthorize("hasAuthority('offer:create')")
    public ResponseEntity<ApiResponse<OfferResponse>> makeOffer(@PathVariable UUID id,
                                                                @Valid @RequestBody CreateOfferRequest request) {
        OfferEntity offer = offerService.makeOffer(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(OfferResponse.from(offer)));
    }
}
