package com.example.se330.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.se330.entity.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

}
