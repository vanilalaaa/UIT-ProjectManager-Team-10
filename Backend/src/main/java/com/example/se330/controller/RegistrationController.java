package com.example.se330.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.registration.RegistrationResponse;
import com.example.se330.security.CustomUserDetails;
import com.example.se330.service.RegistrationService;

// Pipeline đăng ký đề tài: SV đăng ký nhóm cho đề tài (PENDING) → GV duyệt/từ chối.
@RestController
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/courses/{courseId}/projects/{projectId}/registrations")
    public ResponseEntity<ApiResponse<RegistrationResponse>> register(
            @PathVariable Long courseId,
            @PathVariable Long projectId,
            Authentication authentication) {

        Long studentId = currentUserId(authentication);
        return ApiResponse.success(
                registrationService.register(courseId, projectId, studentId),
                "Đăng ký đề tài thành công, chờ giảng viên duyệt.");
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
