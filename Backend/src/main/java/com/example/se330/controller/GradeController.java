package com.example.se330.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.grade.CreateGradeRequest;
import com.example.se330.dto.grade.GradeResponse;
import com.example.se330.dto.grade.UpdateGradeRequest;
import com.example.se330.security.CustomUserDetails;
import com.example.se330.service.GradeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    // Giảng viên chấm điểm bài nộp của project
    @PostMapping("/projects/{id}/grades")
    public ResponseEntity<ApiResponse<GradeResponse>> create(
            @PathVariable Long id,
            @RequestBody CreateGradeRequest request,
            Authentication authentication) {

        Long teacherId = ((CustomUserDetails) authentication.getPrincipal()).getId();
        return ApiResponse.created(gradeService.createGrade(id, request, teacherId));
    }

    // Giảng viên cập nhật điểm / nhận xét
    @PutMapping("/grades/{id}")
    public ResponseEntity<ApiResponse<GradeResponse>> update(
            @PathVariable Long id,
            @RequestBody UpdateGradeRequest request) {

        return ApiResponse.success(gradeService.updateGrade(id, request), "Cập nhật điểm thành công");
    }

    // Sinh viên xem điểm & nhận xét của nhóm mình
    @GetMapping("/projects/{id}/grades/me")
    public ResponseEntity<ApiResponse<GradeResponse>> myGrade(
            @PathVariable Long id,
            Authentication authentication) {

        Long studentId = ((CustomUserDetails) authentication.getPrincipal()).getId();
        return ApiResponse.success(gradeService.getMyGrade(id, studentId));
    }

    // Giảng viên xem điểm hiện tại của 1 bài nộp (null nếu chưa chấm).
    @GetMapping("/submissions/{id}/grade")
    public ResponseEntity<ApiResponse<GradeResponse>> bySubmission(@PathVariable Long id) {
        return ApiResponse.success(gradeService.getBySubmission(id));
    }
}
