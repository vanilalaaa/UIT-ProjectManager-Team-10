package com.example.se330.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.search.GlobalSearchResult;
import com.example.se330.security.CustomUserDetails;
import com.example.se330.service.GlobalSearchService;

@RestController
@RequestMapping("/search")
public class GlobalSearchController {
    private final GlobalSearchService globalSearchService;

    public GlobalSearchController(GlobalSearchService globalSearchService) {
        this.globalSearchService = globalSearchService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GlobalSearchResult>>> search(
            Authentication authentication,
            @RequestParam(defaultValue = "") String query) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<GlobalSearchResult> results = globalSearchService.search(
                userDetails.getId(),
                userDetails.getUser().getRole(),
                query);
        return ApiResponse.success(results, "Tìm kiếm thành công.");
    }
}
