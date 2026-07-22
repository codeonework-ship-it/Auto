package com.autohub.kyc.interfaces.web;

import com.autohub.kyc.application.KycService;
import com.autohub.kyc.interfaces.web.dto.KycResponse;
import com.autohub.kyc.interfaces.web.dto.ReviewRequest;
import com.autohub.kyc.interfaces.web.dto.SubmitKycRequest;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * KYC (buyer/seller verification) web adapter. Submitting/updating one's own profile is gated by
 * {@code kyc:submit}; listing, viewing detail, and approve/reject are gated by {@code kyc:review}.
 * Only text identity fields are accepted — no document files/uploads (per project safety rules).
 */
@RestController
@RequestMapping("/api/v1/kyc")
public class KycController {

    private final KycService kycService;

    public KycController(KycService kycService) {
        this.kycService = kycService;
    }

    // ---- owner (buyer/seller) ----

    @PostMapping
    @PreAuthorize("hasAuthority('kyc:submit')")
    public ResponseEntity<ApiResponse<KycResponse>> submit(@Valid @RequestBody SubmitKycRequest request) {
        KycResponse body = KycResponse.from(kycService.submit(request));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(body));
    }

    @GetMapping("/me")
    public ApiResponse<List<KycResponse>> mine() {
        return ApiResponse.ok(kycService.listMine().stream().map(KycResponse::from).toList());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('kyc:submit')")
    public ApiResponse<KycResponse> update(@PathVariable UUID id,
                                           @Valid @RequestBody SubmitKycRequest request) {
        return ApiResponse.ok(KycResponse.from(kycService.update(id, request)));
    }

    // ---- reviewer ----

    @GetMapping
    @PreAuthorize("hasAuthority('kyc:review')")
    public ApiResponse<List<KycResponse>> listForReview(@RequestParam(required = false) String status) {
        return ApiResponse.ok(kycService.listForReview(status).stream().map(KycResponse::from).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('kyc:review')")
    public ApiResponse<KycResponse> detail(@PathVariable UUID id) {
        return ApiResponse.ok(KycResponse.from(kycService.get(id)));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAuthority('kyc:review')")
    public ApiResponse<KycResponse> approve(@PathVariable UUID id) {
        return ApiResponse.ok(KycResponse.from(kycService.approve(id)));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAuthority('kyc:review')")
    public ApiResponse<KycResponse> reject(@PathVariable UUID id,
                                           @Valid @RequestBody ReviewRequest request) {
        return ApiResponse.ok(KycResponse.from(kycService.reject(id, request.notes())));
    }
}
