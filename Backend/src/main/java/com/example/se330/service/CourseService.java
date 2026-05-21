package com.example.se330.service;

import java.security.SecureRandom;

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
        course.setCode(generateCode());
        course.setLecturer(currentUser.getUser());
        course.setMaxStudents(req.getMaxStudents());
        course.setStartDate(req.getStartDate());
        course.setEndDate(req.getEndDate());

        Course saved = this.courseRepository.save(course);

        return mapToResponse(saved);
    }

    public CourseResponse getCourseResponse(Long id) {
        return mapToResponse(this.getCourseById(id));
    }

    public Course getCourseById(Long id) {
        Course course = this.courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return course;
    }

    public boolean existsCourseByCode(String code) {
        return this.courseRepository.existsByCode(code);
    }

    public Course getCourseByCode(String code) {
        Course course = this.courseRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return course;
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
                .courseId(course.getId())
                .name(course.getName())
                .code(course.getCode())
                .lecturer(course.getLecturer().getId())
                .maxStudents(course.getMaxStudents())
                .startDate(course.getStartDate())
                .endDate(course.getEndDate())
                .build();
    }

    private String generateCode() {
        String code;
        boolean isDuplicate;
        String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        SecureRandom random = new SecureRandom();

        do {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                int randomIndex = random.nextInt(CHARACTERS.length());
                sb.append(CHARACTERS.charAt(randomIndex));
            }
            code = sb.toString();

            isDuplicate = courseRepository.existsByCode(code);

        } while (isDuplicate);
        return code;
    }
}
