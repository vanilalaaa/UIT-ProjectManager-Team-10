package com.example.se330.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.home.FeedItemResponse;
import com.example.se330.dto.project.ProjectResponse;
import com.example.se330.security.CustomUserDetails;
import com.example.se330.service.HomeService;
import com.example.se330.service.StudentService;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/students")
public class StudentController {
    private final StudentService studentService;
    private final HomeService homeService;

    public StudentController(StudentService studentService, HomeService homeService) {
        this.studentService = studentService;
        this.homeService = homeService;
    }

    @GetMapping("/me/projects")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getStudentProjects(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<ProjectResponse> resp = this.studentService.getStudentProjects(userDetails.getId());
        return ApiResponse.success(resp, "Lấy danh sách projects của sinh viên thành công.");
    }
    @GetMapping("/me/feed")
    public ResponseEntity<ApiResponse<List<FeedItemResponse>>> getStudentFeed(
            Authentication authentication,
            @RequestParam(defaultValue = "20") int limit) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<FeedItemResponse> resp = this.homeService.getFeed(userDetails.getId(), limit);
        return ApiResponse.success(resp, "Lấy danh sách hoạt động của sinh viên thành công.");
    }

}
