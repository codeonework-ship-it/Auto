package com.autohub.engagement.application;

import com.autohub.catalog.infrastructure.persistence.PostJpaRepository;
import com.autohub.engagement.domain.event.ReviewAddedEvent;
import com.autohub.engagement.domain.model.ContentStatus;
import com.autohub.engagement.infrastructure.persistence.ReviewEntity;
import com.autohub.engagement.infrastructure.persistence.ReviewJpaRepository;
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
    private final PostJpaRepository posts;
    private final HtmlSanitizer sanitizer;
    private final CurrentUser currentUser;
    private final DomainEventPublisher events;

    public ReviewService(ReviewJpaRepository reviews, PostJpaRepository posts, HtmlSanitizer sanitizer,
                         CurrentUser currentUser, DomainEventPublisher events) {
        this.reviews = reviews;
        this.posts = posts;
        this.sanitizer = sanitizer;
        this.currentUser = currentUser;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public List<ReviewEntity> listVisible(UUID postId) {
        return reviews.findByPostIdAndStatusOrderByCreatedAtDesc(postId, ContentStatus.VISIBLE.name());
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
        return reviews.save(review);
    }

    @Transactional
    public void delete(UUID id) {
        ReviewEntity review = require(id);
        assertOwnerOrModerator(review.getAuthorId());
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
