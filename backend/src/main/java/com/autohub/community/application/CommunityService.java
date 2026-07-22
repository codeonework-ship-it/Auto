package com.autohub.community.application;

import com.autohub.community.domain.model.MembershipRole;
import com.autohub.community.infrastructure.persistence.CommunityEntity;
import com.autohub.community.infrastructure.persistence.CommunityJpaRepository;
import com.autohub.community.infrastructure.persistence.MembershipEntity;
import com.autohub.community.infrastructure.persistence.MembershipJpaRepository;
import com.autohub.community.interfaces.web.dto.CreateGroupRequest;
import com.autohub.shared.application.HtmlSanitizer;
import com.autohub.shared.application.port.CurrentUser;
import com.autohub.shared.domain.exception.ConflictException;
import com.autohub.shared.domain.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

/**
 * Community group use cases: create a group (owner is auto-joined as OWNER), join/leave,
 * and list/detail with live member counts. Descriptions are sanitized on write.
 */
@Service
public class CommunityService {

    private final CommunityJpaRepository communities;
    private final MembershipJpaRepository memberships;
    private final HtmlSanitizer sanitizer;
    private final CurrentUser currentUser;

    public CommunityService(CommunityJpaRepository communities, MembershipJpaRepository memberships,
                            HtmlSanitizer sanitizer, CurrentUser currentUser) {
        this.communities = communities;
        this.memberships = memberships;
        this.sanitizer = sanitizer;
        this.currentUser = currentUser;
    }

    // ---- commands ----

    @Transactional
    public CommunityEntity create(CreateGroupRequest req) {
        UUID ownerId = currentUser.requireUserId();
        String description = req.description() == null ? null : sanitizer.sanitize(req.description());
        CommunityEntity group = new CommunityEntity(
                UUID.randomUUID(), req.name().trim(), uniqueSlug(req.name()), description, ownerId);
        CommunityEntity saved = communities.save(group);
        memberships.save(new MembershipEntity(saved.getId(), ownerId, MembershipRole.OWNER.name()));
        return saved;
    }

    @Transactional
    public void join(UUID communityId) {
        CommunityEntity group = require(communityId);
        UUID userId = currentUser.requireUserId();
        if (memberships.existsByCommunityIdAndUserId(group.getId(), userId)) {
            throw new ConflictException("You are already a member of this group");
        }
        memberships.save(new MembershipEntity(group.getId(), userId, MembershipRole.MEMBER.name()));
    }

    @Transactional
    public void leave(UUID communityId) {
        CommunityEntity group = require(communityId);
        UUID userId = currentUser.requireUserId();
        if (!memberships.existsByCommunityIdAndUserId(group.getId(), userId)) {
            throw new NotFoundException("You are not a member of this group");
        }
        if (group.getOwnerId().equals(userId)) {
            throw new ConflictException("The owner cannot leave their own group");
        }
        memberships.deleteByCommunityIdAndUserId(group.getId(), userId);
    }

    // ---- queries ----

    @Transactional(readOnly = true)
    public List<CommunityEntity> listAll() {
        return communities.findAllByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<CommunityEntity> listMine() {
        UUID userId = currentUser.requireUserId();
        return memberships.findByUserId(userId).stream()
                .map(m -> communities.findById(m.getCommunityId()).orElse(null))
                .filter(java.util.Objects::nonNull)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public CommunityEntity getBySlug(String slug) {
        return communities.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Group not found: " + slug));
    }

    public long memberCount(UUID communityId) {
        return memberships.countByCommunityId(communityId);
    }

    // ---- helpers ----

    private CommunityEntity require(UUID id) {
        return communities.findById(id).orElseThrow(() -> new NotFoundException("Group not found: " + id));
    }

    private String uniqueSlug(String name) {
        String base = slugify(name);
        if (base.isEmpty()) {
            base = "group";
        }
        String candidate = base;
        int attempts = 0;
        while (communities.existsBySlug(candidate)) {
            candidate = base + "-" + UUID.randomUUID().toString().substring(0, 6);
            if (++attempts > 5) {
                throw new ConflictException("Could not generate a unique slug");
            }
        }
        return candidate;
    }

    private static String slugify(String name) {
        return name.toLowerCase(Locale.ROOT).trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
