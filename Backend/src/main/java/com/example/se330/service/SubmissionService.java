package com.example.se330.service;

import com.example.se330.dto.submission.CreateSubmissionRequest;
import com.example.se330.dto.submission.UpdateSubmissionRequest;
import com.example.se330.entity.*;
import com.example.se330.enums.SubmissionStatus;
import com.example.se330.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy project"));

        if (isSubmissionLocked(project)) {
            throw new IllegalStateException("Đã hết hạn nộp bài. Bài nộp đã bị khóa.");
        }

        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhóm"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

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
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài nộp"));

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
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài nộp"));

        submissionRepository.delete(sub);
    }

    public Submission markLateIfNeeded(Submission submission, LocalDateTime deadline) {

        if (submission.getSubmittedAt().isAfter(deadline)) {
            submission.setStatus(SubmissionStatus.LATE);
        }

        return submission;
    }

    public boolean isSubmissionLocked(Project project) {
        if (project.isSubmissionLocked()) {
            return true;
        }
        LocalDate endDate = project.getEndDate();
        return endDate != null && LocalDateTime.now().isAfter(endDate.atTime(LocalTime.MAX));
    }
}