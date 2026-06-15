package com.example.se330.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.project.ProjectResponse;
import com.example.se330.service.ProjectService;

// Lấy chi tiết đồ án theo id (route FE chỉ có projectId, không kèm courseId).
@RestController
@RequestMapping("/projects")
public class ProjectQueryController {

    private final ProjectService projectService;

    public ProjectQueryController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(@PathVariable Long id) {
        return ApiResponse.success(projectService.getProjectResponseById(id), "Lấy chi tiết đồ án thành công.");
    }
}
