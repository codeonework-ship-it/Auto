package com.autohub.media.application;

/**
 * Result of storing an uploaded image: the public URL to serve it, plus the metadata recorded
 * against the post ({@code width}/{@code height} may be null if the format's dimensions could
 * not be read, e.g. some WEBP encodings without an ImageIO plugin).
 */
public record StoredImage(String url, String contentType, long sizeBytes, Integer width, Integer height) {
}
