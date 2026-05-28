package com.example.se330.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.project.ProjectResponse;
import com.example.se330.security.CustomUserDetails;
import com.example.se330.service.StudentService;

@RestController
@RequestMapping("/students")
public class StudentController {
    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/me/projects")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getStudentProjects(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<ProjectResponse> resp = this.studentService.getStudentProjects(userDetails.getId());
        return ApiResponse.success(resp, "Lấy danh sách projects của sinh viên thành công.");
    }

}
