package com.autohub.engagement.interfaces.web;

import com.autohub.engagement.application.CommentService;
import com.autohub.engagement.interfaces.web.dto.CommentResponse;
import com.autohub.engagement.interfaces.web.dto.CreateCommentRequest;
import com.autohub.shared.interfaces.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/** Comments. Reads are public; commenting requires {@code comment:create} (MEMBER+). */
@RestController
@RequestMapping("/api/v1")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/posts/{postId}/comments")
    public ApiResponse<List<CommentResponse>> list(@PathVariable UUID postId) {
        return ApiResponse.ok(commentService.listVisible(postId).stream().map(CommentResponse::from).toList());
    }

    @PostMapping("/posts/{postId}/comments")
    @PreAuthorize("hasAuthority('comment:create')")
    public ResponseEntity<ApiResponse<CommentResponse>> add(@PathVariable UUID postId,
                                                            @Valid @RequestBody CreateCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(CommentResponse.from(commentService.add(postId, request))));
    }

    @PutMapping("/comments/{id}")
    @PreAuthorize("hasAuthority('comment:create')")
    public ApiResponse<CommentResponse> update(@PathVariable UUID id,
                                               @Valid @RequestBody CreateCommentRequest request) {
        return ApiResponse.ok(CommentResponse.from(commentService.update(id, request)));
    }

    @DeleteMapping("/comments/{id}")
    @PreAuthorize("hasAuthority('comment:create') or hasAuthority('comment:moderate')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        commentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
