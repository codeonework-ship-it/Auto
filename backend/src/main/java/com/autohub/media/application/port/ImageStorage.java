package com.autohub.media.application.port;

import com.autohub.media.application.StoredImage;
import org.springframework.web.multipart.MultipartFile;

/**
 * Outbound port for validating and storing an uploaded image. The adapter enforces the
 * platform rules (allowed types, max size, minimum resolution) and throws
 * {@link IllegalArgumentException} with a clear message on any violation.
 */
public interface ImageStorage {

    StoredImage store(MultipartFile file);
}
