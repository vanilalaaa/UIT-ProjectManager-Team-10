package com.example.se330.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.se330.entity.Course;
import com.example.se330.entity.Project;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByCourse(Course course);

    boolean existsByCategory_Id(Long categoryId);

    // Các project đã qua hạn nộp (endDate < ngày truyền vào) mà chưa bị khóa nộp bài
    List<Project> findByEndDateBeforeAndSubmissionLockedFalse(LocalDate date);
}
