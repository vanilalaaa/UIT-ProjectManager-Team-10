package com.example.se330.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.requirement.RequirementResponse;
import com.example.se330.dto.requirement.SaveRequirementRequest;
import com.example.se330.security.CustomUserDetails;
import com.example.se330.service.RequirementService;

// Yêu cầu đồ án + barem chấm điểm của 1 lớp.
// GET: mọi user đã đăng nhập (SV xem barem). PUT: giảng viên của lớp.
@RestController
@RequestMapping("/courses/{courseId}/requirement")
public class RequirementController {

    private final RequirementService requirementService;

    public RequirementController(RequirementService requirementService) {
        this.requirementService = requirementService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<RequirementResponse>> getRequirement(@PathVariable Long courseId) {
        RequirementResponse resp = this.requirementService.getRequirement(courseId);
        return ApiResponse.success(resp, "Lấy yêu cầu đồ án thành công.");
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PutMapping
    public ResponseEntity<ApiResponse<RequirementResponse>> saveRequirement(
            @PathVariable Long courseId,
            @RequestBody SaveRequirementRequest req,
            Authentication authentication) {

        Long teacherId = ((CustomUserDetails) authentication.getPrincipal()).getId();
        RequirementResponse resp = this.requirementService.saveRequirement(courseId, req, teacherId);
        return ApiResponse.success(resp, "Lưu yêu cầu đồ án thành công.");
    }
}
