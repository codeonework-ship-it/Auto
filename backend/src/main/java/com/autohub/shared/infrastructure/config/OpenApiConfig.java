package com.autohub.shared.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI autoHubOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("AutoHub API")
                .description("Clean-architecture, event-driven API for the AutoHub automobile & travel platform")
                .version("v0.1.0")
                .license(new License().name("Proprietary")));
    }
}
