package com.example.se330.controller;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.task.BoardResponse;
import com.example.se330.dto.task.CreateTaskRequest;
import com.example.se330.dto.task.TaskResponse;
import com.example.se330.dto.task.UpdateTaskRequest;
import com.example.se330.dto.task.UpdateTaskStatusRequest;
import com.example.se330.enums.TaskStatus;
import com.example.se330.security.CustomUserDetails;
import com.example.se330.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/projects/{id}/board")
    public ResponseEntity<ApiResponse<BoardResponse>> getBoard(
            @PathVariable Long id,
            Authentication authentication) {

        Long currentUserId = currentUserId(authentication);
        return ApiResponse.success(taskService.getBoard(id, currentUserId), "Lấy bảng công việc thành công.");
    }

    @GetMapping("/projects/{id}/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getProjectTasks(
            @PathVariable Long id,
            @RequestParam(required = false) Long assignee,
            @RequestParam(required = false) TaskStatus status) {

        return ApiResponse.success(taskService.getProjectTasks(id, assignee, status), "Lấy danh sách task thành công.");
    }

    @PostMapping("/projects/{id}/tasks")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @PathVariable Long id,
            @Valid @RequestBody CreateTaskRequest request,
            Authentication authentication) {

        Long currentUserId = currentUserId(authentication);
        return ApiResponse.success(taskService.createTask(id, request, currentUserId), "Tạo task thành công.");
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id,
            @RequestBody UpdateTaskRequest request) {

        return ApiResponse.success(taskService.updateTask(id, request), "Cập nhật task thành công.");
    }

    @PatchMapping("/tasks/{id}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTaskStatus(
            @PathVariable Long id,
            @RequestBody UpdateTaskStatusRequest request) {

        return ApiResponse.success(taskService.updateTaskStatus(id, request.getStatus()), "Cập nhật trạng thái thành công.");
    }

    // Service tự enforce leader/ADMIN — chỉ cần đăng nhập là gọi được.
    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long id,
            Authentication authentication) {

        taskService.deleteTask(id, currentUserId(authentication));
        return ApiResponse.success(null, "Xóa task thành công.");
    }

    private Long currentUserId(Authentication authentication) {
        return ((CustomUserDetails) authentication.getPrincipal()).getId();
    }
}
