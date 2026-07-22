package com.autohub.discovery.application;

import com.autohub.catalog.infrastructure.persistence.PostEntity;
import com.autohub.catalog.infrastructure.persistence.PostJpaRepository;
import com.autohub.discovery.interfaces.web.dto.SearchHit;
import com.autohub.marketplace.infrastructure.persistence.ListingEntity;
import com.autohub.marketplace.infrastructure.persistence.ListingJpaRepository;
import com.autohub.travel.infrastructure.persistence.TravelPostEntity;
import com.autohub.travel.infrastructure.persistence.TravelPostJpaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Read-only discovery over three bounded contexts. Because the source repositories live in
 * other packages (catalog, travel, marketplace) we inject their public {@code JpaRepository}s
 * and filter/search in memory rather than adding query methods there.
 *
 * <p>Only PUBLISHED posts/travel and ACTIVE listings are ever surfaced.
 */
@Service
public class SearchService {

    /** Optional {@code type} filter values. */
    public static final String TYPE_POST = "POST";
    public static final String TYPE_TRAVEL = "TRAVEL";
    public static final String TYPE_LISTING = "LISTING";

    private static final String POST_PUBLISHED = "PUBLISHED";
    private static final String LISTING_ACTIVE = "ACTIVE";

    private static final int PER_TYPE_CAP = 50;
    private static final int FEED_CAP = 30;

    private final PostJpaRepository posts;
    private final TravelPostJpaRepository travelPosts;
    private final ListingJpaRepository listings;

    public SearchService(PostJpaRepository posts, TravelPostJpaRepository travelPosts,
                         ListingJpaRepository listings) {
        this.posts = posts;
        this.travelPosts = travelPosts;
        this.listings = listings;
    }

    /**
     * Search visible items whose title contains {@code query} (case-insensitive).
     *
     * @param query the search term; blank yields an empty list
     * @param type  optional filter in {POST, TRAVEL, LISTING}; {@code null}/blank searches all
     */
    @Transactional(readOnly = true)
    public List<SearchHit> search(String query, String type) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        String needle = query.trim().toLowerCase();
        String wanted = (type == null || type.isBlank()) ? null : type.trim().toUpperCase();

        List<SearchHit> hits = new ArrayList<>();
        if (wanted == null || wanted.equals(TYPE_POST)) {
            posts.findByStatusOrderByPublishedAtDesc(POST_PUBLISHED).stream()
                    .filter(p -> containsIgnoreCase(p.getTitle(), needle))
                    .limit(PER_TYPE_CAP)
                    .map(this::toHit)
                    .forEach(hits::add);
        }
        if (wanted == null || wanted.equals(TYPE_TRAVEL)) {
            travelPosts.findByStatusOrderByPublishedAtDesc(POST_PUBLISHED).stream()
                    .filter(t -> containsIgnoreCase(t.getTitle(), needle))
                    .limit(PER_TYPE_CAP)
                    .map(this::toHit)
                    .forEach(hits::add);
        }
        if (wanted == null || wanted.equals(TYPE_LISTING)) {
            listings.findByStatusOrderByUpdatedAtDesc(LISTING_ACTIVE).stream()
                    .filter(l -> containsIgnoreCase(l.getTitle(), needle))
                    .limit(PER_TYPE_CAP)
                    .map(this::toHit)
                    .forEach(hits::add);
        }
        return hits;
    }

    /**
     * The most recent published/active items across all three types, merged and sorted by
     * published/created time (newest first), capped at {@value #FEED_CAP}.
     */
    @Transactional(readOnly = true)
    public List<SearchHit> feed() {
        List<Ranked> ranked = new ArrayList<>();

        posts.findByStatusOrderByPublishedAtDesc(POST_PUBLISHED).stream()
                .limit(FEED_CAP)
                .forEach(p -> ranked.add(new Ranked(timeOf(p), toHit(p))));
        travelPosts.findByStatusOrderByPublishedAtDesc(POST_PUBLISHED).stream()
                .limit(FEED_CAP)
                .forEach(t -> ranked.add(new Ranked(timeOf(t), toHit(t))));
        listings.findByStatusOrderByUpdatedAtDesc(LISTING_ACTIVE).stream()
                .limit(FEED_CAP)
                .forEach(l -> ranked.add(new Ranked(l.getUpdatedAt(), toHit(l))));

        return ranked.stream()
                .sorted(Comparator.comparing((Ranked r) -> r.when, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(FEED_CAP)
                .map(r -> r.hit)
                .toList();
    }

    // ---- mapping ----

    private SearchHit toHit(PostEntity p) {
        return new SearchHit(TYPE_POST, p.getId().toString(), p.getTitle(),
                p.getKind(), "/posts/" + p.getSlug());
    }

    private SearchHit toHit(TravelPostEntity t) {
        return new SearchHit(TYPE_TRAVEL, t.getId().toString(), t.getTitle(),
                t.getLocation(), "/travel/" + t.getSlug());
    }

    private SearchHit toHit(ListingEntity l) {
        String subtitle = l.getPriceAmount() == null
                ? null
                : (l.getCurrency() == null ? "" : l.getCurrency() + " ") + l.getPriceAmount().toPlainString();
        return new SearchHit(TYPE_LISTING, l.getId().toString(), l.getTitle(),
                subtitle, "/marketplace/" + l.getId());
    }

    private static Instant timeOf(PostEntity p) {
        return p.getPublishedAt() != null ? p.getPublishedAt() : p.getCreatedAt();
    }

    private static Instant timeOf(TravelPostEntity t) {
        return t.getPublishedAt() != null ? t.getPublishedAt() : t.getCreatedAt();
    }

    private static boolean containsIgnoreCase(String value, String lowerNeedle) {
        return value != null && value.toLowerCase().contains(lowerNeedle);
    }

    /** Sortable wrapper pairing a hit with its ordering timestamp. */
    private record Ranked(Instant when, SearchHit hit) {
    }
}
