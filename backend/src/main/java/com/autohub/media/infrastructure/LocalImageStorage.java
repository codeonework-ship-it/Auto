package com.autohub.media.infrastructure;

import com.autohub.media.application.StoredImage;
import com.autohub.media.application.port.ImageStorage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Stores uploaded images on the local filesystem and enforces the platform's image rules:
 * allowed content type, maximum size, and minimum resolution. Files are served back via
 * {@link com.autohub.media.infrastructure.config.MediaWebConfig} under the public base path.
 */
@Component
public class LocalImageStorage implements ImageStorage {

    private static final Logger log = LoggerFactory.getLogger(LocalImageStorage.class);

    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", "jpg", "image/png", "png", "image/webp", "webp");

    private final List<String> allowedContentTypes;
    private final long maxSizeBytes;
    private final int minWidth;
    private final int minHeight;
    private final String publicBasePath;
    private final Path storageDir;

    public LocalImageStorage(
            @Value("${autohub.media.allowed-content-types}") String allowedContentTypes,
            @Value("${autohub.media.max-image-size-bytes}") long maxSizeBytes,
            @Value("${autohub.media.min-width}") int minWidth,
            @Value("${autohub.media.min-height}") int minHeight,
            @Value("${autohub.media.public-base-path:/media}") String publicBasePath,
            @Value("${autohub.media.storage-dir}") String storageDir) {
        this.allowedContentTypes = List.of(allowedContentTypes.split("\\s*,\\s*"));
        this.maxSizeBytes = maxSizeBytes;
        this.minWidth = minWidth;
        this.minHeight = minHeight;
        this.publicBasePath = publicBasePath;
        this.storageDir = Paths.get(storageDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageDir);
            log.info("Media storage directory: {}", this.storageDir);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot create media storage dir: " + this.storageDir, e);
        }
    }

    @Override
    public StoredImage store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Empty file");
        }
        String contentType = file.getContentType() == null
                ? "" : file.getContentType().toLowerCase(Locale.ROOT);
        if (!allowedContentTypes.contains(contentType)) {
            throw new IllegalArgumentException(
                    "Unsupported image type '" + contentType + "'. Allowed: " + allowedContentTypes);
        }
        if (file.getSize() > maxSizeBytes) {
            throw new IllegalArgumentException(
                    "Image exceeds maximum size of " + (maxSizeBytes / (1024 * 1024)) + " MB");
        }

        final byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new IllegalArgumentException("Could not read uploaded file", e);
        }

        Integer width = null;
        Integer height = null;
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(bytes));
            if (image != null) {
                width = image.getWidth();
                height = image.getHeight();
                if (width < minWidth || height < minHeight) {
                    throw new IllegalArgumentException(
                            "Image resolution " + width + "x" + height + " is below the minimum "
                                    + minWidth + "x" + minHeight);
                }
            }
            // If image == null the format has no ImageIO reader (e.g. some WEBP) — accept
            // with unknown dimensions rather than reject a valid, allowed content type.
        } catch (IOException e) {
            throw new IllegalArgumentException("Could not decode image", e);
        }

        String ext = EXTENSIONS.getOrDefault(contentType, "bin");
        String filename = UUID.randomUUID() + "." + ext;
        try {
            Files.write(storageDir.resolve(filename), bytes);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store image", e);
        }

        String url = publicBasePath + "/" + filename;
        return new StoredImage(url, contentType, file.getSize(), width, height);
    }
}
