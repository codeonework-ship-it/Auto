package com.autohub.engagement.application;

import com.autohub.catalog.infrastructure.persistence.PostJpaRepository;
import com.autohub.engagement.domain.model.ContentStatus;
import com.autohub.engagement.infrastructure.persistence.CommentEntity;
import com.autohub.engagement.infrastructure.persistence.CommentJpaRepository;
import com.autohub.engagement.interfaces.web.dto.CreateCommentRequest;
import com.autohub.shared.application.HtmlSanitizer;
import com.autohub.shared.application.port.CurrentUser;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Comments on car/bike posts (one level of threading). Creating a comment requires the
 * {@code comment:create} permission (held by MEMBER) — this enforces "sign up to comment".
 */
@Service
public class CommentService {

    private static final String MODERATE = "comment:moderate";

    private final CommentJpaRepository comments;
    private final PostJpaRepository posts;
    private final HtmlSanitizer sanitizer;
    private final CurrentUser currentUser;

    public CommentService(CommentJpaRepository comments, PostJpaRepository posts,
                          HtmlSanitizer sanitizer, CurrentUser currentUser) {
        this.comments = comments;
        this.posts = posts;
        this.sanitizer = sanitizer;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public List<CommentEntity> listVisible(UUID postId) {
        return comments.findByPostIdAndStatusOrderByCreatedAtAsc(postId, ContentStatus.VISIBLE.name());
    }

    @Transactional
    public CommentEntity add(UUID postId, CreateCommentRequest req) {
        if (!posts.existsById(postId)) {
            throw new NotFoundException("Post not found: " + postId);
        }
        UUID parentId = parseParent(req.parentId(), postId);
        UUID authorId = currentUser.requireUserId();
        CommentEntity comment = new CommentEntity(UUID.randomUUID(), postId, authorId, parentId,
                sanitizer.sanitize(req.body()), ContentStatus.VISIBLE.name());
        return comments.save(comment);
    }

    @Transactional
    public CommentEntity update(UUID id, CreateCommentRequest req) {
        CommentEntity comment = require(id);
        assertOwner(comment.getAuthorId());
        comment.setBody(sanitizer.sanitize(req.body()));
        return comments.save(comment);
    }

    @Transactional
    public void delete(UUID id) {
        CommentEntity comment = require(id);
        if (!comment.getAuthorId().equals(currentUser.requireUserId())
                && !currentUser.hasPermission(MODERATE)) {
            throw new AccessDeniedException("You may only delete your own comment");
        }
        comments.delete(comment);
    }

    private CommentEntity require(UUID id) {
        return comments.findById(id).orElseThrow(() -> new NotFoundException("Comment not found: " + id));
    }

    private void assertOwner(UUID authorId) {
        if (!authorId.equals(currentUser.requireUserId())) {
            throw new AccessDeniedException("You may only modify your own comment");
        }
    }

    private UUID parseParent(String parentId, UUID postId) {
        if (parentId == null || parentId.isBlank()) {
            return null;
        }
        UUID pid;
        try {
            pid = UUID.fromString(parentId);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid parentId: " + parentId);
        }
        CommentEntity parent = comments.findById(pid)
                .orElseThrow(() -> new NotFoundException("Parent comment not found"));
        if (!parent.getPostId().equals(postId)) {
            throw new IllegalArgumentException("Parent comment belongs to a different post");
        }
        if (parent.getParentId() != null) {
            throw new IllegalArgumentException("Only one level of comment threading is supported");
        }
        return pid;
    }
}
