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
import com.example.se330.dto.project.ProjectResourceResponse;
import com.example.se330.security.CustomUserDetails;
import com.example.se330.service.ProjectResourceService;

// Tài nguyên nhóm theo đồ án (liên kết / tệp). Mọi user đã đăng nhập đều xem được;
// thêm/xóa do FE giới hạn theo trưởng nhóm.
@RestController
@RequestMapping("/projects/{projectId}/resources")
public class ProjectResourceController {

    private final ProjectResourceService resourceService;

    public ProjectResourceController(ProjectResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResourceResponse>>> list(@PathVariable Long projectId) {
        return ApiResponse.success(resourceService.list(projectId), "Lấy tài nguyên nhóm thành công.");
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProjectResourceResponse>> add(
            @PathVariable Long projectId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String label,
            @RequestParam(required = false) String url,
            @RequestParam(required = false) MultipartFile file,
            Authentication authentication) throws IOException {

        return ApiResponse.success(
                resourceService.add(projectId, type, label, url, file, currentUserId(authentication)),
                "Đã thêm tài nguyên.");
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long projectId,
            @PathVariable Long resourceId,
            Authentication authentication) {
        resourceService.delete(projectId, resourceId, currentUserId(authentication));
        return ApiResponse.success("Đã xóa tài nguyên.");
    }

    private Long currentUserId(Authentication authentication) {
        return ((CustomUserDetails) authentication.getPrincipal()).getId();
    }
}
