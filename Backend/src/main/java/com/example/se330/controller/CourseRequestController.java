package com.example.se330.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.join_course.JoinCourseItemResponse;
import com.example.se330.dto.join_course.JoinCourseRequest;
import com.example.se330.dto.join_course.JoinCourseResponse;
import com.example.se330.service.CourseRequestService;

@RestController
@RequestMapping("/courses")
public class CourseRequestController {
    private final CourseRequestService courseRequestService;

    public CourseRequestController(CourseRequestService courseRequestService) {
        this.courseRequestService = courseRequestService;
    }

    @PostMapping("/join-requests")
    public ResponseEntity<ApiResponse<JoinCourseResponse>> requestToJoinCourse(@RequestBody JoinCourseRequest req) {
        JoinCourseResponse join = this.courseRequestService.requestToJoinCourse(req);
        return ApiResponse.success(join, "Đã gửi yêu cầu tham gia vào lớp.");
    }

    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/{courseId}/join-requests")
    public ResponseEntity<ApiResponse<List<JoinCourseItemResponse>>> getCourseJoinRequest(
            @PathVariable Long courseId) {
        List<JoinCourseItemResponse> resp = this.courseRequestService.getCourseJoinRequests(courseId);
        return ApiResponse.success(resp, "Lấy danh sách yêu cầu tham gia lớp thành công.");
    }

    @PatchMapping("/{courseId}/join-requests/{studentId}")
    public ResponseEntity<ApiResponse<List<JoinCourseItemResponse>>> approveStudentRequest(
            @PathVariable Long courseId, @PathVariable Long studentId) {
        this.courseRequestService.approveStudentRequest(courseId, studentId);
        return ApiResponse.success("Phê duyệt thành công");
    }
}
