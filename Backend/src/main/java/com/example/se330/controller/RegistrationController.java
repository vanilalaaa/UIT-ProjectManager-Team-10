package com.example.se330.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.registration.ProposeProjectRequest;
import com.example.se330.dto.registration.RegistrationResponse;
import com.example.se330.security.CustomUserDetails;
import com.example.se330.service.RegistrationService;

// Pipeline đăng ký đề tài: nhóm đề xuất đề tài (PENDING) → GV duyệt (tạo đồ án) / từ chối.
@RestController
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/courses/{courseId}/groups/{groupId}/project-requests")
    public ResponseEntity<ApiResponse<RegistrationResponse>> propose(
            @PathVariable Long courseId,
            @PathVariable Long groupId,
            @RequestBody ProposeProjectRequest req,
            Authentication authentication) {

        Long userId = currentUserId(authentication);
        return ApiResponse.success(
                registrationService.proposeProject(courseId, groupId, req.getTitle(), req.getDescription(), userId),
                "Đã gửi đề xuất đề tài, chờ giảng viên duyệt.");
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @GetMapping("/courses/{courseId}/registrations")
    public ResponseEntity<ApiResponse<List<RegistrationResponse>>> getPending(@PathVariable Long courseId) {
        return ApiResponse.success(
                registrationService.getPending(courseId),
                "Lấy danh sách yêu cầu đăng ký thành công.");
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PatchMapping("/registrations/{id}/approve")
    public ResponseEntity<ApiResponse<RegistrationResponse>> approve(
            @PathVariable Long id, Authentication authentication) {
        return ApiResponse.success(
                registrationService.approve(id, currentUserId(authentication)),
                "Đã duyệt yêu cầu đăng ký.");
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PatchMapping("/registrations/{id}/reject")
    public ResponseEntity<ApiResponse<RegistrationResponse>> reject(
            @PathVariable Long id, Authentication authentication) {
        return ApiResponse.success(
                registrationService.reject(id, currentUserId(authentication)),
                "Đã từ chối yêu cầu đăng ký.");
    }

    private Long currentUserId(Authentication authentication) {
        return ((CustomUserDetails) authentication.getPrincipal()).getId();
    }
}
