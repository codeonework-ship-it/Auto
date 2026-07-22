package com.autohub.discovery.interfaces.web;

import com.autohub.discovery.application.SearchService;
import com.autohub.discovery.interfaces.web.dto.SearchHit;
import com.autohub.shared.interfaces.web.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Discovery web adapter — global search and a unified recent-activity feed across catalog
 * posts, travel posts and marketplace listings. Both endpoints are public reads
 * ({@code /api/v1/search/**} and {@code /api/v1/feed/**} are already permitAll).
 */
@RestController
public class DiscoveryController {

    private final SearchService searchService;

    public DiscoveryController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/api/v1/search")
    public ApiResponse<List<SearchHit>> search(@RequestParam(name = "q", required = false) String q,
                                               @RequestParam(name = "type", required = false) String type) {
        return ApiResponse.ok(searchService.search(q, type));
    }

    @GetMapping("/api/v1/feed")
    public ApiResponse<List<SearchHit>> feed() {
        return ApiResponse.ok(searchService.feed());
    }
}
