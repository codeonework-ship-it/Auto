package com.autohub.engagement.application;

import com.autohub.adminops.infrastructure.persistence.ReviewTagRepository;
import com.autohub.catalog.infrastructure.persistence.PostJpaRepository;
import com.autohub.engagement.domain.event.ReviewAddedEvent;
import com.autohub.engagement.domain.model.ContentStatus;
import com.autohub.engagement.infrastructure.persistence.ReviewEntity;
import com.autohub.engagement.infrastructure.persistence.ReviewJpaRepository;
import com.autohub.engagement.infrastructure.persistence.ReviewTagLinkEntity;
import com.autohub.engagement.infrastructure.persistence.ReviewTagLinkJpaRepository;
import com.autohub.engagement.interfaces.web.dto.CreateReviewRequest;
import com.autohub.shared.application.HtmlSanitizer;
import com.autohub.shared.application.port.CurrentUser;
import com.autohub.shared.application.port.DomainEventPublisher;
import com.autohub.shared.domain.exception.ConflictException;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.UUID;

/**
 * Reviews on car/bike posts. Creating a review requires the {@code review:create} permission
 * (held by MEMBER) — the "sign up to review" rule. One review per author per post.
 */
@Service
public class ReviewService {

    private static final String MODERATE = "comment:moderate";

    private final ReviewJpaRepository reviews;
    private final ReviewTagLinkJpaRepository tagLinks;
    private final ReviewTagRepository reviewTags;
    private final PostJpaRepository posts;
    private final HtmlSanitizer sanitizer;
    private final CurrentUser currentUser;
    private final DomainEventPublisher events;

    public ReviewService(ReviewJpaRepository reviews, ReviewTagLinkJpaRepository tagLinks,
                         ReviewTagRepository reviewTags, PostJpaRepository posts, HtmlSanitizer sanitizer,
                         CurrentUser currentUser, DomainEventPublisher events) {
        this.reviews = reviews;
        this.tagLinks = tagLinks;
        this.reviewTags = reviewTags;
        this.posts = posts;
        this.sanitizer = sanitizer;
        this.currentUser = currentUser;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public List<ReviewEntity> listVisible(UUID postId) {
        return reviews.findByPostIdAndStatusOrderByCreatedAtDesc(postId, ContentStatus.VISIBLE.name());
    }

    /** Tag ids (UUID strings) currently linked to the given review. */
    @Transactional(readOnly = true)
    public List<String> tagIds(UUID reviewId) {
        return tagLinks.findByReviewId(reviewId).stream()
                .map(link -> link.getTagId().toString())
                .toList();
    }

    @Transactional
    public ReviewEntity add(UUID postId, CreateReviewRequest req) {
        if (!posts.existsById(postId)) {
            throw new NotFoundException("Post not found: " + postId);
        }
        UUID authorId = currentUser.requireUserId();
        if (reviews.existsByPostIdAndAuthorId(postId, authorId)) {
            throw new ConflictException("You have already reviewed this post");
        }
        ReviewEntity review = new ReviewEntity(UUID.randomUUID(), postId, authorId,
                (short) req.rating(), sanitizer.sanitize(req.body()), ContentStatus.VISIBLE.name());
        ReviewEntity saved = reviews.save(review);
        replaceTagLinks(saved.getId(), req.tagIds());
        events.publish(new ReviewAddedEvent(saved.getId().toString(), postId.toString(),
                authorId.toString(), saved.getRating(), Instant.now()));
        return saved;
    }

    @Transactional
    public ReviewEntity update(UUID id, CreateReviewRequest req) {
        ReviewEntity review = require(id);
        assertOwner(review.getAuthorId());
        review.setRating((short) req.rating());
        review.setBody(sanitizer.sanitize(req.body()));
        ReviewEntity saved = reviews.save(review);
        replaceTagLinks(saved.getId(), req.tagIds());
        return saved;
    }

    /**
     * Replaces a review's tag links with the given tag ids. Each id must be a valid UUID that
     * exists in the {@code master_review_tags} master, else a 400 (IllegalArgumentException) is raised.
     * A null/empty list clears all links.
     */
    private void replaceTagLinks(UUID reviewId, List<String> tagIds) {
        tagLinks.deleteByReviewId(reviewId);
        if (tagIds == null || tagIds.isEmpty()) {
            return;
        }
        LinkedHashSet<UUID> unique = new LinkedHashSet<>();
        for (String raw : tagIds) {
            if (raw == null || raw.isBlank()) {
                continue;
            }
            UUID tagId;
            try {
                tagId = UUID.fromString(raw.trim());
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid review tag id: " + raw);
            }
            if (reviewTags.findById(tagId).isEmpty()) {
                throw new IllegalArgumentException("Unknown review tag: " + raw);
            }
            unique.add(tagId);
        }
        for (UUID tagId : unique) {
            tagLinks.save(new ReviewTagLinkEntity(reviewId, tagId));
        }
    }

    @Transactional
    public void delete(UUID id) {
        ReviewEntity review = require(id);
        assertOwnerOrModerator(review.getAuthorId());
        tagLinks.deleteByReviewId(review.getId());
        reviews.delete(review);
    }

    private ReviewEntity require(UUID id) {
        return reviews.findById(id).orElseThrow(() -> new NotFoundException("Review not found: " + id));
    }

    private void assertOwner(UUID authorId) {
        if (!authorId.equals(currentUser.requireUserId())) {
            throw new AccessDeniedException("You may only modify your own review");
        }
    }

    private void assertOwnerOrModerator(UUID authorId) {
        if (!authorId.equals(currentUser.requireUserId()) && !currentUser.hasPermission(MODERATE)) {
            throw new AccessDeniedException("You may only delete your own review");
        }
    }
}
