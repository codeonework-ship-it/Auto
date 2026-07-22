package com.autohub.moderation.interfaces.web;

import com.autohub.engagement.interfaces.web.dto.CommentResponse;
import com.autohub.engagement.interfaces.web.dto.ReviewResponse;
import com.autohub.moderation.application.ModerationService;
import com.autohub.moderation.interfaces.web.dto.ReportResponse;
import com.autohub.moderation.interfaces.web.dto.StatusRequest;
import com.autohub.shared.interfaces.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/** Moderator queue and actions. Report triage requires {@code report:review}; hiding content
 *  requires {@code comment:moderate}. */
@RestController
@RequestMapping("/api/v1/moderation")
public class ModerationController {

    private final ModerationService moderationService;

    public ModerationController(ModerationService moderationService) {
        this.moderationService = moderationService;
    }

    @GetMapping("/reports")
    @PreAuthorize("hasAuthority('report:review')")
    public ApiResponse<List<ReportResponse>> reports(@RequestParam(required = false) String status) {
        return ApiResponse.ok(moderationService.listReports(status).stream().map(ReportResponse::from).toList());
    }

    @PatchMapping("/reports/{id}")
    @PreAuthorize("hasAuthority('report:review')")
    public ApiResponse<ReportResponse> triage(@PathVariable UUID id, @Valid @RequestBody StatusRequest request) {
        return ApiResponse.ok(ReportResponse.from(moderationService.setReportStatus(id, request.status())));
    }

    @PatchMapping("/comments/{id}/status")
    @PreAuthorize("hasAuthority('comment:moderate')")
    public ApiResponse<CommentResponse> moderateComment(@PathVariable UUID id,
                                                        @Valid @RequestBody StatusRequest request) {
        return ApiResponse.ok(CommentResponse.from(moderationService.setCommentStatus(id, request.status())));
    }

    @PatchMapping("/reviews/{id}/status")
    @PreAuthorize("hasAuthority('comment:moderate')")
    public ApiResponse<ReviewResponse> moderateReview(@PathVariable UUID id,
                                                      @Valid @RequestBody StatusRequest request) {
        return ApiResponse.ok(ReviewResponse.from(moderationService.setReviewStatus(id, request.status())));
    }
}
