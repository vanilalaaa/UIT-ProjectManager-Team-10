package com.example.se330.service;

import com.example.se330.dto.submission.CreateSubmissionRequest;
import com.example.se330.dto.submission.UpdateSubmissionRequest;
import com.example.se330.entity.*;
import com.example.se330.enums.SubmissionStatus;
import com.example.se330.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProjectRepository projectRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    public List<Submission> getByProject(Long projectId) {
        return submissionRepository.findByProject_Id(projectId);
    }

    public Submission createSubmission(Long projectId, CreateSubmissionRequest request, Long userId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new EntityNotFoundException("Group not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Submission submission = Submission.builder()
                .filePath(request.getFilePath())
                .project(project)
                .group(group)
                .status(SubmissionStatus.SUBMITTED)
                .submittedAt(LocalDateTime.now())
                .build();

        return submissionRepository.save(submission);
    }

    public Submission updateSubmission(Long id, UpdateSubmissionRequest request) {

        Submission sub = submissionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Submission not found"));

        if (request.getFilePath() != null) {
            sub.setFilePath(request.getFilePath());
        }

        if (request.getStatus() != null) {
            sub.setStatus(request.getStatus());
        }

        return submissionRepository.save(sub);
    }

    public void deleteSubmission(Long id) {

        Submission sub = submissionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Submission not found"));

        submissionRepository.delete(sub);
    }

    public Submission markLateIfNeeded(Submission submission, LocalDateTime deadline) {

        if (submission.getSubmittedAt().isAfter(deadline)) {
            submission.setStatus(SubmissionStatus.LATE);
        }

        return submission;
    }
}