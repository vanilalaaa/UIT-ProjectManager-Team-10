package com.example.se330.repository;

import com.example.se330.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByProject_Id(Long projectId);
    List<Submission> findByGroup_Id(Long groupId);
    
    Submission findTopByGroup_IdOrderBySubmittedAtDesc(Long groupId);
}