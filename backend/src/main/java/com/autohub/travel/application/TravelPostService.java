package com.autohub.travel.application;

import com.autohub.media.application.StoredImage;
import com.autohub.media.application.port.ImageStorage;
import com.autohub.media.domain.event.ImageUploadedEvent;
import com.autohub.shared.application.HtmlSanitizer;
import com.autohub.shared.application.port.CurrentUser;
import com.autohub.shared.application.port.DomainEventPublisher;
import com.autohub.shared.domain.exception.ConflictException;
import com.autohub.shared.domain.exception.NotFoundException;
import com.autohub.travel.domain.event.TravelPostPublishedEvent;
import com.autohub.travel.domain.model.TravelStatus;
import com.autohub.travel.infrastructure.persistence.TravelPostEntity;
import com.autohub.travel.infrastructure.persistence.TravelPostImageEntity;
import com.autohub.travel.infrastructure.persistence.TravelPostImageJpaRepository;
import com.autohub.travel.infrastructure.persistence.TravelPostJpaRepository;
import com.autohub.travel.interfaces.web.dto.CreateTravelPostRequest;
import com.autohub.travel.interfaces.web.dto.UpdateTravelPostRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Travel use cases: create/update/publish travel blog posts. Rich text is sanitized on write;
 * publishing emits {@code travel.post.published} via the Outbox. Structurally mirrors the
 * catalog {@code PostService} (slug generation, ownership checks, draft visibility).
 */
@Service
public class TravelPostService {

    private final TravelPostJpaRepository posts;
    private final TravelPostImageJpaRepository images;
    private final ImageStorage imageStorage;
    private final HtmlSanitizer sanitizer;
    private final CurrentUser currentUser;
    private final DomainEventPublisher events;
    private final int maxImagesPerPost;

    public TravelPostService(TravelPostJpaRepository posts, TravelPostImageJpaRepository images,
                             ImageStorage imageStorage, HtmlSanitizer sanitizer,
                             CurrentUser currentUser, DomainEventPublisher events,
                             @Value("${autohub.media.max-images-per-post:20}") int maxImagesPerPost) {
        this.posts = posts;
        this.images = images;
        this.imageStorage = imageStorage;
        this.sanitizer = sanitizer;
        this.currentUser = currentUser;
        this.events = events;
        this.maxImagesPerPost = maxImagesPerPost;
    }

    // ---- commands ----

    @Transactional
    public TravelPostEntity create(CreateTravelPostRequest req) {
        UUID authorId = currentUser.requireUserId();
        TravelPostEntity post = new TravelPostEntity(
                UUID.randomUUID(), authorId, req.title().trim(), uniqueSlug(req.title()),
                sanitizer.sanitize(req.bodyHtml()), trimToNull(req.location()));
        return posts.save(post);
    }

    @Transactional
    public TravelPostEntity update(UUID id, UpdateTravelPostRequest req) {
        TravelPostEntity post = require(id);
        assertCanModify(post);
        post.setTitle(req.title().trim());
        post.setBodyHtml(sanitizer.sanitize(req.bodyHtml()));
        post.setLocation(trimToNull(req.location()));
        return posts.save(post);
    }

    @Transactional
    public TravelPostEntity publish(UUID id) {
        TravelPostEntity post = require(id);
        assertCanModify(post);
        post.setStatus(TravelStatus.PUBLISHED.name());
        post.setPublishedAt(Instant.now());
        TravelPostEntity saved = posts.save(post);
        events.publish(new TravelPostPublishedEvent(
                saved.getId().toString(), saved.getSlug(),
                saved.getAuthorId().toString(), Instant.now()));
        return saved;
    }

    // ---- images ----

    @Transactional
    public List<TravelPostImageEntity> addImages(UUID postId, List<MultipartFile> files) {
        TravelPostEntity post = require(postId);
        assertCanModify(post);
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("No files provided");
        }
        long existing = images.countByTravelPostId(postId);
        if (existing + files.size() > maxImagesPerPost) {
            throw new IllegalArgumentException(
                    "A travel post may have at most " + maxImagesPerPost + " images (has " + existing
                            + ", tried to add " + files.size() + ")");
        }
        int position = (int) existing;
        for (MultipartFile file : files) {
            StoredImage stored = imageStorage.store(file);   // validates type/size/resolution
            TravelPostImageEntity image = new TravelPostImageEntity(
                    UUID.randomUUID(), postId, stored.url(), stored.contentType(),
                    stored.sizeBytes(), stored.width(), stored.height(), position++);
            images.save(image);
            events.publish(new ImageUploadedEvent(
                    image.getId().toString(), postId.toString(), stored.url(), Instant.now()));
        }
        return images.findByTravelPostIdOrderByPositionAsc(postId);
    }

    @Transactional
    public void removeImage(UUID postId, UUID imageId) {
        TravelPostEntity post = require(postId);
        assertCanModify(post);
        TravelPostImageEntity image = images.findByIdAndTravelPostId(imageId, postId)
                .orElseThrow(() -> new NotFoundException("Image not found on this travel post"));
        images.delete(image);
    }

    @Transactional(readOnly = true)
    public List<TravelPostImageEntity> imagesOf(UUID postId) {
        return images.findByTravelPostIdOrderByPositionAsc(postId);
    }

    // ---- queries ----

    @Transactional(readOnly = true)
    public List<TravelPostEntity> listPublished() {
        return posts.findByStatusOrderByPublishedAtDesc(TravelStatus.PUBLISHED.name());
    }

    @Transactional(readOnly = true)
    public List<TravelPostEntity> listMine() {
        return posts.findByAuthorIdOrderByCreatedAtDesc(currentUser.requireUserId());
    }

    @Transactional(readOnly = true)
    public TravelPostEntity getVisibleBySlug(String slug) {
        TravelPostEntity post = posts.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Travel post not found: " + slug));
        if (!TravelStatus.PUBLISHED.name().equals(post.getStatus()) && !canModifySilently(post)) {
            throw new NotFoundException("Travel post not found: " + slug);  // hide drafts from non-owners
        }
        return post;
    }

    // ---- helpers ----

    private TravelPostEntity require(UUID id) {
        return posts.findById(id)
                .orElseThrow(() -> new NotFoundException("Travel post not found: " + id));
    }

    private void assertCanModify(TravelPostEntity post) {
        if (!canModifySilently(post)) {
            throw new AccessDeniedException("You may only modify your own travel posts");
        }
    }

    private boolean canModifySilently(TravelPostEntity post) {
        try {
            return post.getAuthorId().equals(currentUser.requireUserId());
        } catch (RuntimeException unauthenticated) {
            return false;
        }
    }

    private String uniqueSlug(String title) {
        String base = slugify(title);
        if (base.isEmpty()) {
            base = "travel-post";
        }
        String candidate = base;
        int attempts = 0;
        while (posts.existsBySlug(candidate)) {
            candidate = base + "-" + UUID.randomUUID().toString().substring(0, 6);
            if (++attempts > 5) {
                throw new ConflictException("Could not generate a unique slug");
            }
        }
        return candidate;
    }

    private static String slugify(String title) {
        return title.toLowerCase(Locale.ROOT).trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
