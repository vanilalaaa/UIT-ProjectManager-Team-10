package com.example.se330.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.se330.entity.RequirementFile;

@Repository
public interface RequirementFileRepository extends JpaRepository<RequirementFile, Long> {

    List<RequirementFile> findByCourse_IdOrderByIdDesc(Long courseId);
    List<RequirementFile> findByCourse_IdAndCriterion_IdOrderByIdDesc(Long courseId, Long criterionId);
    List<RequirementFile> findByCourse_IdAndSubmissionRequirement_IdOrderByIdDesc(Long courseId, Long submissionRequirementId);
    List<RequirementFile> findByCourse_IdAndCriterionIsNullOrderByIdDesc(Long courseId);
}
