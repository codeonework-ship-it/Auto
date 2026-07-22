package com.autohub.shared.application;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

/**
 * Sanitizes user-supplied rich-text (HTML) from the editor before it is persisted, stripping
 * scripts, event handlers and other XSS vectors while preserving safe formatting, links and
 * images. Applied to every post/listing/travel body.
 */
@Component
public class HtmlSanitizer {

    private final Safelist safelist = Safelist.relaxed()
            .addTags("figure", "figcaption", "span", "hr")
            .addAttributes("a", "target", "rel")
            .addAttributes("span", "class")
            .addProtocols("img", "src", "http", "https", "data");

    /** Returns sanitized HTML, or null/empty passed through unchanged. */
    public String sanitize(String html) {
        if (html == null || html.isBlank()) {
            return html;
        }
        return Jsoup.clean(html, safelist);
    }
}
