package com.example.se330.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
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
}
