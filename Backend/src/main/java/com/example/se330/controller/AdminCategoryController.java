package com.example.se330.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.CategoryDto;
import com.example.se330.service.AdminCategoryService;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {
    private final AdminCategoryService adminCategoryService;

    public AdminCategoryController(AdminCategoryService adminCategoryService) {
        this.adminCategoryService = adminCategoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CategoryDto>>> getCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        Page<CategoryDto> categories = adminCategoryService.listCategories(page, size, search);
        return ApiResponse.success(categories, "Admin category list retrieved successfully");
    }
}
