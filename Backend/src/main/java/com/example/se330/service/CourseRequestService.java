package com.example.se330.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.se330.dto.join_course.JoinCourseItemResponse;
import com.example.se330.dto.join_course.JoinCourseRequest;
import com.example.se330.dto.join_course.JoinCourseResponse;
import com.example.se330.dto.join_course.MemberInCourseResponse;
import com.example.se330.entity.Course;
import com.example.se330.entity.CourseRequest;
import com.example.se330.entity.User;
import com.example.se330.enums.JoinStatus;
import com.example.se330.repository.CourseRequestRepository;
import com.example.se330.security.CustomUserDetails;

@Service
public class CourseRequestService {
    private final CourseRequestRepository courseRequestRepository;
    private final CourseService courseService;

    public CourseRequestService(
            CourseRequestRepository courseRequestRepository,
            CourseService courseService) {
        this.courseRequestRepository = courseRequestRepository;
        this.courseService = courseService;
    }

    public JoinCourseResponse requestToJoinCourse(JoinCourseRequest req) {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User currentUser = userDetails.getUser();
        Course course = courseService.getCourseByCode(req.getCode());

        if (this.courseRequestRepository.existsByStudent_IdAndCourse_Id(currentUser.getId(),
                course.getId())) {
            throw new RuntimeException("Bạn đã gửi yêu cầu rồi.");
        }

        // Tham gia lớp tức thì, không cần giảng viên duyệt (không có UI duyệt vào lớp).
        CourseRequest jc = CourseRequest.builder()
                .course(course)
                .student(currentUser)
                .requestAt(LocalDateTime.now())
                .status(JoinStatus.ACTIVE)
                .build();

        CourseRequest saved = this.courseRequestRepository.save(jc);

        return mapToResponse(saved);
    }

    public List<JoinCourseItemResponse> getCourseJoinRequests(Long id) {
        Course course = this.courseService.getCourseById(id);

        List<JoinCourseItemResponse> resp = this.courseRequestRepository
                .findAllByCourseAndStatus(course, JoinStatus.PENDING)
                .stream()
                .map(this::mapToItemResponse)
                .toList();

        return resp;
    }

    public void approveStudentRequest(Long courseId, Long userId) {
        CourseRequest courseRequest = this.courseRequestRepository.findByCourse_IdAndStudent_Id(courseId, userId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        courseRequest.setStatus(JoinStatus.ACTIVE);
        courseRequestRepository.save(courseRequest);
    }

    public List<MemberInCourseResponse> getMemberInCourse(Long id) {
        List<MemberInCourseResponse> resp = this.courseRequestRepository.findAllByCourseId(id)
                .stream()
                .map(this::mapToMemberInCourseResponse)
                .toList();

        return resp;
    }

    public JoinCourseResponse mapToResponse(CourseRequest entity) {
        return JoinCourseResponse.builder()
                .joinCourseId(entity.getId())
                .courseId(entity.getCourse().getId())
                .code(entity.getCourse().getCode())
                .studentId(entity.getStudent().getId())
                .requestAt(entity.getRequestAt())
                .status(entity.getStatus())
                .build();
    }

    public JoinCourseItemResponse mapToItemResponse(CourseRequest entity) {
        JoinCourseItemResponse resp = new JoinCourseItemResponse();
        resp.setStudentId(entity.getId());
        resp.setName(entity.getStudent().getName());
        resp.setStatus(entity.getStatus());
        resp.setRequestAt(entity.getRequestAt());

        return resp;
    }

    public MemberInCourseResponse mapToMemberInCourseResponse(CourseRequest entity) {
        MemberInCourseResponse resp = new MemberInCourseResponse();
        resp.setStudentId(entity.getId());
        resp.setName(entity.getStudent().getName());
        resp.setEmail(entity.getStudent().getEmail());

        return resp;
    }
}
