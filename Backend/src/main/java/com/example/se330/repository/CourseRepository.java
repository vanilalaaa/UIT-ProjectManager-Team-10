package com.example.se330.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.se330.entity.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    boolean existsByCode(String code);

    Optional<Course> findByCode(String code);

    // Các khóa học do một giảng viên phụ trách
    List<Course> findByLecturer_Id(Long lecturerId);
}
