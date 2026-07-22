package com.autohub.media.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Serves stored images from the media directory under the public base path (default {@code /media}).
 */
@Configuration
public class MediaWebConfig implements WebMvcConfigurer {

    private final String publicBasePath;
    private final String storageDir;

    public MediaWebConfig(@Value("${autohub.media.public-base-path:/media}") String publicBasePath,
                          @Value("${autohub.media.storage-dir}") String storageDir) {
        this.publicBasePath = publicBasePath;
        this.storageDir = storageDir;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = Paths.get(storageDir).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler(publicBasePath + "/**")
                .addResourceLocations(location);
    }
}
