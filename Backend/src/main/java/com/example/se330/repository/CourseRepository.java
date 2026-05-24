package com.example.se330.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.se330.entity.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    boolean existsByCode(String code);

 	  Page<Course> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Optional<Course> findByCode(String code);
}
