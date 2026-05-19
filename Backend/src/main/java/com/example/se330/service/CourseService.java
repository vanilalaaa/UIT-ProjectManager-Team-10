package com.example.se330.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.se330.dto.course.CourseResponse;
import com.example.se330.dto.course.CreateCourseRequest;
import com.example.se330.dto.course.UpdateCourseRequest;
import com.example.se330.entity.Course;
import com.example.se330.repository.CourseRepository;
import com.example.se330.security.CustomUserDetails;

@Service
public class CourseService {
    private final CourseRepository courseRepository;

    public CourseService(
            CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public CourseResponse createCourse(CreateCourseRequest req) {
        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        CustomUserDetails currentUser = (CustomUserDetails) authentication.getPrincipal();

        Course course = new Course();
        course.setName(req.getName());
        course.setLecturer(currentUser.getUser());
        course.setMaxStudents(req.getMaxStudents());
        course.setStartDate(req.getStartDate());
        course.setEndDate(req.getEndDate());

        Course saved = this.courseRepository.save(course);

        return mapToResponse(saved);
    }

    public CourseResponse getCourseById(Long id) {
        Course course = this.courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return mapToResponse(course);
    }

    public CourseResponse updateCourse(Long id, UpdateCourseRequest req) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        course.setName(req.getName());
        course.setMaxStudents(req.getMaxStudents());
        course.setStartDate(req.getStartDate());
        course.setEndDate(req.getEndDate());
        this.courseRepository.save(course);

        return mapToResponse(course);
    }

    public void deleteCourse(Long id) {
        this.courseRepository.deleteById(id);
    }

    private CourseResponse mapToResponse(Course course) {
        return CourseResponse.builder()
                .courseId(course.getCourseId())
                .name(course.getName())
                .lecturer(course.getLecturer().getUserId())
                .maxStudents(course.getMaxStudents())
                .startDate(course.getStartDate())
                .endDate(course.getEndDate())
                .build();
    }
}
