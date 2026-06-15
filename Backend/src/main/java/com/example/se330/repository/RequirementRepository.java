package com.example.se330.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.se330.entity.Requirement;

@Repository
public interface RequirementRepository extends JpaRepository<Requirement, Long> {

    Optional<Requirement> findByCourse_Id(Long courseId);
}
