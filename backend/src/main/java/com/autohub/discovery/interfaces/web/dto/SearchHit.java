package com.autohub.discovery.interfaces.web.dto;

/**
 * A single discovery result — a normalized view over a catalog post, a travel post
 * or a marketplace listing, used by both search and the unified feed.
 *
 * @param type     one of {@code POST}, {@code TRAVEL}, {@code LISTING}
 * @param id       source entity id (UUID string)
 * @param title    display title
 * @param subtitle short secondary line (kind, location or price) — may be {@code null}
 * @param url      web-app relative link to the item
 */
public record SearchHit(String type, String id, String title, String subtitle, String url) {
}
