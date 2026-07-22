package com.autohub.moderation.interfaces.web;

import com.autohub.moderation.application.ModerationService;
import com.autohub.moderation.interfaces.web.dto.CreateReportRequest;
import com.autohub.moderation.interfaces.web.dto.ReportResponse;
import com.autohub.shared.interfaces.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Any authenticated user can report content; the moderator queue lives under /moderation. */
@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ModerationService moderationService;

    public ReportController(ModerationService moderationService) {
        this.moderationService = moderationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponse>> create(@Valid @RequestBody CreateReportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(ReportResponse.from(moderationService.createReport(request))));
    }
}
