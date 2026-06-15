package com.example.se330.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.CategoryDto;
import com.example.se330.service.AdminCategoryService;

// Đọc danh mục cho mọi user đã đăng nhập (TEACHER cần để gán loại đồ án).
// Chỉnh sửa danh mục vẫn chỉ ADMIN (/api/admin/categories).
@RestController
@RequestMapping("/categories")
public class CategoryController {
    private final AdminCategoryService adminCategoryService;

    public CategoryController(AdminCategoryService adminCategoryService) {
        this.adminCategoryService = adminCategoryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories() {
        List<CategoryDto> resp = this.adminCategoryService.listActiveCategories();
        return ApiResponse.success(resp, "Lấy danh sách danh mục thành công.");
    }
}
