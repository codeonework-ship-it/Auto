package com.autohub.travel.interfaces.web;

import com.autohub.shared.interfaces.web.ApiResponse;
import com.autohub.travel.application.TourService;
import com.autohub.travel.infrastructure.persistence.TourEntity;
import com.autohub.travel.interfaces.web.dto.CreateTourRequest;
import com.autohub.travel.interfaces.web.dto.TourResponse;
import com.autohub.travel.interfaces.web.dto.UpdateTourRequest;
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
 * Tour-guide web adapter. Listing and detail are public; offering and editing a tour are
 * permission-gated ({@code tour:create}) and ownership-checked (by guide) in the service.
 */
@RestController
@RequestMapping("/api/v1/travel/tours")
public class TourController {

    private final TourService tourService;

    public TourController(TourService tourService) {
        this.tourService = tourService;
    }

    // ---- reads ----

    @GetMapping
    public ApiResponse<List<TourResponse>> list() {
        return ApiResponse.ok(tourService.listAll().stream().map(TourResponse::from).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<TourResponse> detail(@PathVariable UUID id) {
        return ApiResponse.ok(TourResponse.from(tourService.get(id)));
    }

    // ---- writes ----

    @PostMapping
    @PreAuthorize("hasAuthority('tour:create')")
    public ResponseEntity<ApiResponse<TourResponse>> create(@Valid @RequestBody CreateTourRequest request) {
        TourEntity tour = tourService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(TourResponse.from(tour)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('tour:create')")
    public ApiResponse<TourResponse> update(@PathVariable UUID id,
                                            @Valid @RequestBody UpdateTourRequest request) {
        TourEntity tour = tourService.update(id, request);
        return ApiResponse.ok(TourResponse.from(tour));
    }
}
