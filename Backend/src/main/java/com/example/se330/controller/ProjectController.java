package com.example.se330.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.home.FeedItemResponse;
import com.example.se330.dto.project.CreateProjectRequest;
import com.example.se330.dto.project.ProjectResponse;
import com.example.se330.dto.project.UpdateProjectRequest;
import com.example.se330.service.ProjectService;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/courses/{courseId}/projects")
public class ProjectController {
    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(@PathVariable Long courseId,
            @RequestBody CreateProjectRequest req) {
        ProjectResponse resp = this.projectService.createProject(courseId, req);
        return ApiResponse.success(resp, "Create project successfully");
    }

    // 2. READ ALL: Lấy danh sách đồ án thuộc khóa học (Teacher vào lớp xem danh
    // sách)
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjectsByCourse(
            @PathVariable Long courseId) {

        List<ProjectResponse> resp = this.projectService.getProjectsByCourse(courseId);
        return ApiResponse.success(resp, "Get projects successfully");
    }

    // 3. READ DETAIL: Xem chi tiết một đồ án cụ thể
    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectDetail(
            @PathVariable Long courseId,
            @PathVariable Long projectId) {

        ProjectResponse resp = this.projectService.getProjectDetail(courseId, projectId);
        return ApiResponse.success(resp, "Get project detail successfully");
    }

    // 3.1 READ ACTIVITIES: Lấy hoạt động gần đây của đồ án
    @GetMapping("/{projectId}/activities")
    public ResponseEntity<ApiResponse<List<FeedItemResponse>>> getProjectRecentActivity(
            @PathVariable Long courseId,
            @PathVariable Long projectId,
            @RequestParam(defaultValue = "10") int limit) {
        
        List<FeedItemResponse> resp = this.projectService.getProjectRecentActivity(courseId, projectId, limit);
        return ApiResponse.success(resp, "Get project recent activities successfully");
    }

    // 4. UPDATE: Giáo viên cập nhật thông tin đồ án (Tên, mô tả, hạn chót, trạng
    // thái...)
    @PutMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable Long courseId,
            @PathVariable Long projectId,
            @Valid @RequestBody UpdateProjectRequest req) { // Tạo UpdateProjectRequest tương tự Create

        ProjectResponse resp = this.projectService.updateProject(courseId, projectId, req);
        return ApiResponse.success(resp, "Update project successfully");
    }

    // 5. DELETE: Giáo viên xóa đồ án khỏi khóa học
    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable Long courseId,
            @PathVariable Long projectId) {

        this.projectService.deleteProject(courseId, projectId);
        return ApiResponse.success(null, "Delete project successfully");
    }
}
