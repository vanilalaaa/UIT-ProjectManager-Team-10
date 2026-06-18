package com.example.se330.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.task.TaskResourceResponse;
import com.example.se330.security.CustomUserDetails;
import com.example.se330.service.TaskResourceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/tasks/{taskId}/resources")
@RequiredArgsConstructor
public class TaskResourceController {

    private final TaskResourceService resourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskResourceResponse>>> list(@PathVariable Long taskId) {
        return ApiResponse.success(resourceService.list(taskId), "Lấy tài nguyên task thành công.");
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<TaskResourceResponse>> addFile(
            @PathVariable Long taskId,
            @RequestParam(required = false) String label,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        return ApiResponse.success(
                resourceService.addFile(taskId, file, currentUserId(authentication)),
                "Đã thêm tệp.");
    }

    @PostMapping("/link")
    public ResponseEntity<ApiResponse<TaskResourceResponse>> addLink(
            @PathVariable Long taskId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String label,
            @RequestParam String url,
            Authentication authentication) {

        return ApiResponse.success(
                resourceService.addLink(taskId, type, label, url, currentUserId(authentication)),
                "Đã thêm liên kết.");
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long taskId,
            @PathVariable Long resourceId,
            Authentication authentication) {

        resourceService.delete(taskId, resourceId, currentUserId(authentication));
        return ApiResponse.success("Đã xóa tài nguyên.");
    }

    private Long currentUserId(Authentication authentication) {
        return ((CustomUserDetails) authentication.getPrincipal()).getId();
    }
}
