package com.example.se330.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.CategoryDto;
import com.example.se330.dto.admin.AdminCreateCategoryRequest;
import com.example.se330.dto.admin.AdminUpdateCategoryRequest;
import com.example.se330.service.AdminCategoryService;

import jakarta.validation.Valid;

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

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(
            @Valid @RequestBody AdminCreateCategoryRequest request) {
        CategoryDto category = adminCategoryService.createCategory(request);
        return ApiResponse.created(category);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateCategoryRequest request) {
        CategoryDto category = adminCategoryService.updateCategory(id, request);
        return ApiResponse.success(category, "Category updated successfully");
    }
}
