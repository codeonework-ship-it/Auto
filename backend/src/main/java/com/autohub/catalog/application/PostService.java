package com.autohub.catalog.application;

import com.autohub.catalog.domain.event.PostPublishedEvent;
import com.autohub.catalog.domain.model.PostStatus;
import com.autohub.catalog.infrastructure.persistence.PostEntity;
import com.autohub.catalog.infrastructure.persistence.PostImageEntity;
import com.autohub.catalog.infrastructure.persistence.PostImageJpaRepository;
import com.autohub.catalog.infrastructure.persistence.PostJpaRepository;
import com.autohub.catalog.interfaces.web.dto.CreatePostRequest;
import com.autohub.catalog.interfaces.web.dto.UpdatePostRequest;
import com.autohub.media.application.StoredImage;
import com.autohub.media.application.port.ImageStorage;
import com.autohub.media.domain.event.ImageUploadedEvent;
import com.autohub.shared.application.HtmlSanitizer;
import com.autohub.shared.application.port.CurrentUser;
import com.autohub.shared.application.port.DomainEventPublisher;
import com.autohub.shared.domain.exception.ConflictException;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Catalog use cases: create/update/publish/delete car & bike posts and manage their image
 * galleries. Rich text is sanitized on write; publishing emits {@code catalog.post.published}
 * and each image upload emits {@code media.image.uploaded} via the Outbox.
 */
@Service
public class PostService {

    private final PostJpaRepository posts;
    private final PostImageJpaRepository images;
    private final HtmlSanitizer sanitizer;
    private final ImageStorage imageStorage;
    private final CurrentUser currentUser;
    private final DomainEventPublisher events;
    private final int maxImagesPerPost;

    public PostService(PostJpaRepository posts, PostImageJpaRepository images, HtmlSanitizer sanitizer,
                       ImageStorage imageStorage, CurrentUser currentUser, DomainEventPublisher events,
                       @org.springframework.beans.factory.annotation.Value("${autohub.media.max-images-per-post:20}") int maxImagesPerPost) {
        this.posts = posts;
        this.images = images;
        this.sanitizer = sanitizer;
        this.imageStorage = imageStorage;
        this.currentUser = currentUser;
        this.events = events;
        this.maxImagesPerPost = maxImagesPerPost;
    }

    // ---- commands ----

    @Transactional
    public PostEntity create(CreatePostRequest req) {
        UUID authorId = currentUser.requireUserId();
        PostEntity post = new PostEntity(
                UUID.randomUUID(), authorId, req.kind().toUpperCase(Locale.ROOT), req.title().trim(),
                uniqueSlug(req.title()), sanitizer.sanitize(req.bodyHtml()),
                parseUuid(req.makeId()), parseUuid(req.modelId()), parseUuid(req.variantId()));
        return posts.save(post);
    }

    @Transactional
    public PostEntity update(UUID id, UpdatePostRequest req) {
        PostEntity post = require(id);
        assertCanModify(post);
        post.setTitle(req.title().trim());
        post.setBodyHtml(sanitizer.sanitize(req.bodyHtml()));
        post.setMakeId(parseUuid(req.makeId()));
        post.setModelId(parseUuid(req.modelId()));
        post.setVariantId(parseUuid(req.variantId()));
        post.touch();
        return posts.save(post);
    }

    @Transactional
    public PostEntity publish(UUID id) {
        PostEntity post = require(id);
        assertCanModify(post);
        post.setStatus(PostStatus.PUBLISHED.name());
        post.setPublishedAt(Instant.now());
        post.touch();
        PostEntity saved = posts.save(post);
        events.publish(new PostPublishedEvent(
                saved.getId().toString(), saved.getKind(), saved.getSlug(),
                saved.getAuthorId().toString(), Instant.now()));
        return saved;
    }

    @Transactional
    public void delete(UUID id) {
        PostEntity post = require(id);
        assertCanModify(post);
        images.deleteAll(images.findByPostIdOrderByPositionAsc(id));
        posts.delete(post);
    }

    @Transactional
    public List<PostImageEntity> addImages(UUID postId, List<MultipartFile> files) {
        PostEntity post = require(postId);
        assertCanModify(post);
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("No files provided");
        }
        long existing = images.countByPostId(postId);
        if (existing + files.size() > maxImagesPerPost) {
            throw new IllegalArgumentException(
                    "A post may have at most " + maxImagesPerPost + " images (has " + existing
                            + ", tried to add " + files.size() + ")");
        }
        int position = (int) existing;
        for (MultipartFile file : files) {
            StoredImage stored = imageStorage.store(file);   // validates type/size/resolution
            PostImageEntity image = new PostImageEntity(
                    UUID.randomUUID(), postId, stored.url(), stored.contentType(),
                    stored.sizeBytes(), stored.width(), stored.height(), position++);
            images.save(image);
            events.publish(new ImageUploadedEvent(
                    image.getId().toString(), postId.toString(), stored.url(), Instant.now()));
        }
        post.touch();
        posts.save(post);
        return images.findByPostIdOrderByPositionAsc(postId);
    }

    @Transactional
    public void removeImage(UUID postId, UUID imageId) {
        PostEntity post = require(postId);
        assertCanModify(post);
        PostImageEntity image = images.findByIdAndPostId(imageId, postId)
                .orElseThrow(() -> new NotFoundException("Image not found on this post"));
        images.delete(image);
    }

    // ---- queries ----

    @Transactional(readOnly = true)
    public List<PostEntity> listPublished(String kind) {
        if (kind == null || kind.isBlank()) {
            return posts.findByStatusOrderByPublishedAtDesc(PostStatus.PUBLISHED.name());
        }
        return posts.findByStatusAndKindOrderByPublishedAtDesc(
                PostStatus.PUBLISHED.name(), kind.toUpperCase(Locale.ROOT));
    }

    @Transactional(readOnly = true)
    public List<PostEntity> listMine() {
        return posts.findByAuthorIdOrderByUpdatedAtDesc(currentUser.requireUserId());
    }

    @Transactional(readOnly = true)
    public PostEntity getVisibleBySlug(String slug) {
        PostEntity post = posts.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Post not found: " + slug));
        if (!PostStatus.PUBLISHED.name().equals(post.getStatus()) && !canModifySilently(post)) {
            throw new NotFoundException("Post not found: " + slug);  // hide drafts from non-owners
        }
        return post;
    }

    @Transactional(readOnly = true)
    public List<PostImageEntity> imagesOf(UUID postId) {
        return images.findByPostIdOrderByPositionAsc(postId);
    }

    public long imageCount(UUID postId) {
        return images.countByPostId(postId);
    }

    // ---- helpers ----

    private PostEntity require(UUID id) {
        return posts.findById(id).orElseThrow(() -> new NotFoundException("Post not found: " + id));
    }

    private void assertCanModify(PostEntity post) {
        if (!canModifySilently(post)) {
            throw new AccessDeniedException("You may only modify your own posts");
        }
    }

    private boolean canModifySilently(PostEntity post) {
        try {
            return post.getAuthorId().equals(currentUser.requireUserId())
                    || currentUser.hasPermission("post:moderate");
        } catch (RuntimeException unauthenticated) {
            return false;
        }
    }

    private String uniqueSlug(String title) {
        String base = slugify(title);
        if (base.isEmpty()) {
            base = "post";
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

    private static UUID parseUuid(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid UUID: " + value);
        }
    }
}
