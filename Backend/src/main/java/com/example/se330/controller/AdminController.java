package com.example.se330.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.CategoryDto;
import com.example.se330.dto.UserDto;
import com.example.se330.dto.admin.AdminCreateCategoryRequest;
import com.example.se330.dto.admin.AdminUpdateCategoryRequest;
import com.example.se330.dto.admin.AdminUpdateCategoryStatusRequest;
import com.example.se330.dto.admin.course.AdminCreateCourseRequest;
import com.example.se330.dto.admin.course.AdminUpdateCourseRequest;
import com.example.se330.dto.auth.AdminCreateUserRequest;
import com.example.se330.dto.auth.AdminUpdateUserRequest;
import com.example.se330.dto.auth.AdminUpdateUserStatusRequest;
import com.example.se330.dto.course.CourseResponse;
import com.example.se330.service.AdminCategoryService;
import com.example.se330.service.AdminCourseService;
import com.example.se330.service.AdminUserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminUserService adminUserService;
    private final AdminCategoryService adminCategoryService;
    private final AdminCourseService adminCourseService;

    public AdminController(
            AdminUserService adminUserService,
            AdminCategoryService adminCategoryService,
            AdminCourseService adminCourseService) {
        this.adminUserService = adminUserService;
        this.adminCategoryService = adminCategoryService;
        this.adminCourseService = adminCourseService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserDto>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        Page<UserDto> users = adminUserService.listUsers(page, size, search);
        return ApiResponse.success(users, "Admin user list retrieved successfully");
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<UserDto>> createUser(
            @Valid @RequestBody AdminCreateUserRequest request) {

        UserDto userDto = adminUserService.createUser(request);
        return ApiResponse.created(userDto);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest request) {

        UserDto userDto = adminUserService.updateUser(id, request);
        return ApiResponse.success(userDto, "User updated successfully");
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserStatusRequest request) {

        UserDto userDto = adminUserService.updateUserStatus(id, request);
        return ApiResponse.success(userDto, "User status updated successfully");
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        UserDto userDto = adminUserService.getUserById(id);
        return ApiResponse.success(userDto, "User detail retrieved successfully");
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<Page<CategoryDto>>> getCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        Page<CategoryDto> categories = adminCategoryService.listCategories(page, size, search);
        return ApiResponse.success(categories, "Admin category list retrieved successfully");
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(
            @Valid @RequestBody AdminCreateCategoryRequest request) {

        CategoryDto category = adminCategoryService.createCategory(request);
        return ApiResponse.created(category);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable Long id,
            @RequestBody AdminUpdateCategoryRequest request) {

        CategoryDto category = adminCategoryService.updateCategory(id, request);
        return ApiResponse.success(category, "Category updated successfully");
    }

    @PatchMapping("/categories/{id}/status")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategoryStatus(
            @PathVariable Long id,
            @RequestBody AdminUpdateCategoryStatusRequest request) {

        CategoryDto category = adminCategoryService.updateCategoryStatus(id, request);
        return ApiResponse.success(category, "Category status updated successfully");
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryById(@PathVariable Long id) {
        CategoryDto category = adminCategoryService.getCategoryById(id);
        return ApiResponse.success(category, "Category detail retrieved successfully");
    }

    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<Page<CourseResponse>>> getCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        Page<CourseResponse> courses = adminCourseService.listCourses(page, size, search);
        return ApiResponse.success(courses, "Admin course list retrieved successfully");
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseById(@PathVariable Long id) {
        CourseResponse course = adminCourseService.getCourseById(id);
        return ApiResponse.success(course, "Course detail retrieved successfully");
    }

    @PostMapping("/courses")
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(
            @Valid @RequestBody AdminCreateCourseRequest request) {

        CourseResponse course = adminCourseService.createCourse(request);
        return ApiResponse.created(course);
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable Long id,
            @RequestBody AdminUpdateCourseRequest request) {

        CourseResponse course = adminCourseService.updateCourse(id, request);
        return ApiResponse.success(course, "Course updated successfully");
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCourse(@PathVariable Long id) {
        adminCourseService.deleteCourse(id);
        return ApiResponse.success("Course deleted successfully");
    }
}