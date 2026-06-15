package com.example.se330.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.course.CourseCardResponse;
import com.example.se330.dto.group.InvitationResponse;
import com.example.se330.dto.home.FeedItemResponse;
import com.example.se330.dto.project.ProjectResponse;
import com.example.se330.security.CustomUserDetails;
import com.example.se330.service.CourseService;
import com.example.se330.service.GroupService;
import com.example.se330.service.HomeService;
import com.example.se330.service.StudentService;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/students")
public class StudentController {
    private final StudentService studentService;
    private final CourseService courseService;
    private final GroupService groupService;
    private final HomeService homeService;

    public StudentController(StudentService studentService, CourseService courseService,
            GroupService groupService, HomeService homeService) {
        this.studentService = studentService;
        this.courseService = courseService;
        this.groupService = groupService;
        this.homeService = homeService;
    }

    @GetMapping("/me/projects")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getStudentProjects(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<ProjectResponse> resp = this.studentService.getStudentProjects(userDetails.getId());
        return ApiResponse.success(resp, "Lấy danh sách projects của sinh viên thành công.");
    }
    @GetMapping("/me/feed")
    public ResponseEntity<ApiResponse<List<FeedItemResponse>>> getStudentFeed(
            Authentication authentication,
            @RequestParam(defaultValue = "20") int limit) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<FeedItemResponse> resp = this.homeService.getFeed(userDetails.getId(), limit);
        return ApiResponse.success(resp, "Lấy danh sách hoạt động của sinh viên thành công.");
    }

    @GetMapping("/me/courses")
    public ResponseEntity<ApiResponse<List<CourseCardResponse>>> getStudentCourses(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<CourseCardResponse> resp = this.courseService.getStudentCourses(userDetails.getId());
        return ApiResponse.success(resp, "Lấy danh sách lớp của sinh viên thành công.");
    }

    // Lời mời nhóm gửi đến SV đang đăng nhập
    @GetMapping("/me/invitations")
    public ResponseEntity<ApiResponse<List<InvitationResponse>>> getMyInvitations(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ApiResponse.success(this.groupService.getMyInvitations(userDetails.getId()));
    }

    @PostMapping("/me/invitations/{groupMemberId}/accept")
    public ResponseEntity<ApiResponse<String>> acceptInvitation(
            Authentication authentication, @PathVariable Long groupMemberId) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        this.groupService.acceptInvitation(userDetails.getId(), groupMemberId);
        return ApiResponse.success("Đã tham gia nhóm.");
    }

    @PostMapping("/me/invitations/{groupMemberId}/decline")
    public ResponseEntity<ApiResponse<String>> declineInvitation(
            Authentication authentication, @PathVariable Long groupMemberId) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        this.groupService.declineInvitation(userDetails.getId(), groupMemberId);
        return ApiResponse.success("Đã từ chối lời mời.");
    }

}
