package com.example.se330.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.se330.dto.admin.course.AdminCreateCourseRequest;
import com.example.se330.dto.admin.course.AdminUpdateCourseRequest;
import com.example.se330.dto.course.CourseResponse;
import com.example.se330.entity.Course;
import com.example.se330.entity.User;
import com.example.se330.repository.CourseRepository;
import com.example.se330.repository.UserRepository;

@Service
public class AdminCourseService {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public AdminCourseService(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    public Page<CourseResponse> listCourses(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "courseId"));

        Page<Course> courses;
        if (search == null || search.isBlank()) {
            courses = courseRepository.findAll(pageable);
        } else {
            courses = courseRepository.findByNameContainingIgnoreCase(search, pageable);
        }

        return courses.map(this::mapToResponse);
    }

    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        return mapToResponse(course);
    }

    public CourseResponse createCourse(AdminCreateCourseRequest request) {
        User lecturer = userRepository.findById(request.getLecturerId())
                .orElseThrow(() -> new IllegalArgumentException("Lecturer not found"));

        Course course = new Course();
        course.setName(request.getName());
        course.setLecturer(lecturer);
        course.setMaxStudents(request.getMaxStudents());
        course.setStartDate(request.getStartDate());
        course.setEndDate(request.getEndDate());

        Course saved = courseRepository.save(course);
        return mapToResponse(saved);
    }

    public CourseResponse updateCourse(Long id, AdminUpdateCourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            course.setName(request.getName());
        }

        if (request.getLecturerId() != null) {
            User lecturer = userRepository.findById(request.getLecturerId())
                    .orElseThrow(() -> new IllegalArgumentException("Lecturer not found"));
            course.setLecturer(lecturer);
        }

        if (request.getMaxStudents() != null) {
            course.setMaxStudents(request.getMaxStudents());
        }

        if (request.getStartDate() != null) {
            course.setStartDate(request.getStartDate());
        }

        if (request.getEndDate() != null) {
            course.setEndDate(request.getEndDate());
        }

        Course saved = courseRepository.save(course);
        return mapToResponse(saved);
    }

    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new IllegalArgumentException("Course not found");
        }

        courseRepository.deleteById(id);
    }

    private CourseResponse mapToResponse(Course course) {
        return CourseResponse.builder()
                .courseId(course.getCourseId())
                .name(course.getName())
                .lecturer(course.getLecturer() != null ? course.getLecturer().getUserId() : null)
                .maxStudents(course.getMaxStudents())
                .startDate(course.getStartDate())
                .endDate(course.getEndDate())
                .build();
    }
}