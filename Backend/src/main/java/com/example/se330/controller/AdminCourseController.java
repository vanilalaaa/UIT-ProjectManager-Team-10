package com.example.se330.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.admin.course.AdminCreateCourseRequest;
import com.example.se330.dto.admin.course.AdminUpdateCourseRequest;
import com.example.se330.dto.course.CourseResponse;
import com.example.se330.service.AdminCourseService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/courses")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCourseController {
    private final AdminCourseService adminCourseService;

    public AdminCourseController(AdminCourseService adminCourseService) {
        this.adminCourseService = adminCourseService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CourseResponse>>> getCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        Page<CourseResponse> courses = adminCourseService.listCourses(page, size, search);
        return ApiResponse.success(courses, "Admin course list retrieved successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseById(@PathVariable Long id) {
        CourseResponse course = adminCourseService.getCourseById(id);
        return ApiResponse.success(course, "Course detail retrieved successfully");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(
            @Valid @RequestBody AdminCreateCourseRequest request) {

        CourseResponse course = adminCourseService.createCourse(request);
        return ApiResponse.created(course);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable Long id,
            @RequestBody AdminUpdateCourseRequest request) {

        CourseResponse course = adminCourseService.updateCourse(id, request);
        return ApiResponse.success(course, "Course updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCourse(@PathVariable Long id) {
        adminCourseService.deleteCourse(id);
        return ApiResponse.success("Course deleted successfully");
    }
}