package com.example.se330.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.se330.entity.RubricCriterion;

@Repository
public interface RubricCriterionRepository extends JpaRepository<RubricCriterion, Long> {
}
