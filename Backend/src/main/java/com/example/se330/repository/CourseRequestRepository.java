package com.example.se330.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.se330.entity.Course;
import com.example.se330.entity.CourseRequest;
import com.example.se330.enums.JoinStatus;

@Repository
public interface CourseRequestRepository extends JpaRepository<CourseRequest, Long> {
    List<CourseRequest> findAllByCourseAndStatus(Course course, JoinStatus status);

    List<CourseRequest> findAllById(Long id);

    boolean existsByStudent_IdAndCourse_Id(Long student, Long course);

    Optional<CourseRequest> findByCourse_IdAndStudent_Id(Long courseId, Long studentId);
}
