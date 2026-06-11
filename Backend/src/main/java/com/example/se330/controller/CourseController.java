package com.example.se330.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.course.CourseResponse;
import com.example.se330.dto.course.CreateCourseRequest;
import com.example.se330.dto.course.UpdateCourseRequest;
import com.example.se330.dto.join_course.JoinCourseItemResponse;
import com.example.se330.dto.join_course.MemberInCourseResponse;
import com.example.se330.service.CourseRequestService;
import com.example.se330.service.CourseService;

@RestController
@RequestMapping("/courses")
public class CourseController {
    private final CourseService courseService;
    private final CourseRequestService courseRequestService;

    public CourseController(
            CourseService courseService,
            CourseRequestService courseRequestService) {
        this.courseService = courseService;
        this.courseRequestService = courseRequestService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getCourses() {
        List<CourseResponse> resp = this.courseService.getAllCourses();
        return ApiResponse.success(resp, "Lấy danh sách lớp học thành công.");
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(@RequestBody CreateCourseRequest req) {
        CourseResponse resp = this.courseService.createCourse(req);
        return ApiResponse.success(resp, "Tạo mới lớp học thành công.");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourse(@PathVariable Long id) {
        CourseResponse resp = this.courseService.getCourseResponse(id);
        return ApiResponse.success(resp, "Xem lớp học thành công.");
    }

    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/{id}/member")
    public ResponseEntity<ApiResponse<List<MemberInCourseResponse>>> getMemberInCourse(@PathVariable Long id) {
        List<MemberInCourseResponse> resp = this.courseRequestService.getMemberInCourse(id);
        return ApiResponse.success(resp, "Lấy danh sách thành viên trong lớp thành công.");
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(@PathVariable Long id,
            @RequestBody UpdateCourseRequest req) {
        CourseResponse resp = this.courseService.updateCourse(id, req);
        return ApiResponse.success(resp, "Cập nhật lớp học thành công.");
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCourse(@PathVariable Long id) {
        this.courseService.deleteCourse(id);
        return ApiResponse.success("Xóa lớp học thành công.");
    }

    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping("/{courseId}/join-requests")
    public ResponseEntity<ApiResponse<List<JoinCourseItemResponse>>> getCourseJoinRequest(
            @PathVariable Long courseId) {
        List<JoinCourseItemResponse> resp = this.courseRequestService.getCourseJoinRequests(courseId);
        return ApiResponse.success(resp, "Lấy danh sách yêu cầu tham gia lớp thành công.");
    }

    @PreAuthorize("hasRole('TEACHER')")
    @PatchMapping("/{courseId}/join-requests/{studentId}")
    public ResponseEntity<ApiResponse<List<JoinCourseItemResponse>>> approveStudentRequest(
            @PathVariable Long courseId, @PathVariable Long studentId) {
        this.courseRequestService.approveStudentRequest(courseId, studentId);
        return ApiResponse.success("Phê duyệt thành công");
    }

}
