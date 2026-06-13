package com.example.se330.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.se330.dto.grade.CreateGradeRequest;
import com.example.se330.dto.grade.GradeResponse;
import com.example.se330.dto.grade.UpdateGradeRequest;
import com.example.se330.entity.Grade;
import com.example.se330.entity.Submission;
import com.example.se330.entity.User;
import com.example.se330.enums.SubmissionStatus;
import com.example.se330.repository.GradeRepository;
import com.example.se330.repository.GroupMemberRepository;
import com.example.se330.repository.SubmissionRepository;
import com.example.se330.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class GradeService {

    private final GradeRepository gradeRepository;
    private final SubmissionRepository submissionRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    public GradeResponse createGrade(Long projectId, CreateGradeRequest request, Long teacherId) {

        Submission submission = submissionRepository.findById(request.getSubmissionId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy bài nộp"));

        if (submission.getProject() == null || !submission.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Bài nộp không thuộc project này");
        }

        if (gradeRepository.findBySubmission_Id(submission.getId()).isPresent()) {
            throw new IllegalStateException(
                    "Bài nộp đã được chấm điểm. Dùng PUT /grades/{id} để cập nhật.");
        }

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

        Grade grade = Grade.builder()
                .submission(submission)
                .score(request.getScore())
                .maxScore(request.getMaxScore())
                .feedback(request.getFeedback())
                .gradedBy(teacher)
                .gradedAt(LocalDateTime.now())
                .build();

        submission.setStatus(SubmissionStatus.GRADED);
        submissionRepository.save(submission);

        return toResponse(gradeRepository.save(grade));
    }


    public GradeResponse updateGrade(Long gradeId, UpdateGradeRequest request) {

        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy điểm"));

        if (request.getScore() != null) {
            grade.setScore(request.getScore());
        }
        if (request.getMaxScore() != null) {
            grade.setMaxScore(request.getMaxScore());
        }
        if (request.getFeedback() != null) {
            grade.setFeedback(request.getFeedback());
        }
        grade.setGradedAt(LocalDateTime.now());

        return toResponse(gradeRepository.save(grade));
    }

    @Transactional(readOnly = true)
    public GradeResponse getMyGrade(Long projectId, Long studentId) {

        List<Submission> submissions = submissionRepository.findByProject_Id(projectId);

        for (Submission submission : submissions) {
            if (submission.getGroup() == null) {
                continue;
            }
            boolean isMember = groupMemberRepository
                    .findByGroupIdAndUserId(submission.getGroup().getId(), studentId)
                    .isPresent();
            if (!isMember) {
                continue;
            }
            Grade grade = gradeRepository.findBySubmission_Id(submission.getId()).orElse(null);
            if (grade != null) {
                return toResponse(grade);
            }
        }

        throw new EntityNotFoundException("Chưa có điểm cho bài nộp của bạn trong project này");
    }

    private GradeResponse toResponse(Grade grade) {
        Submission submission = grade.getSubmission();
        User gradedBy = grade.getGradedBy();

        return GradeResponse.builder()
                .id(grade.getId())
                .submissionId(submission != null ? submission.getId() : null)
                .projectId(submission != null && submission.getProject() != null
                        ? submission.getProject().getId() : null)
                .groupId(submission != null && submission.getGroup() != null
                        ? submission.getGroup().getId() : null)
                .score(grade.getScore())
                .maxScore(grade.getMaxScore())
                .feedback(grade.getFeedback())
                .gradedAt(grade.getGradedAt())
                .gradedById(gradedBy != null ? gradedBy.getId() : null)
                .gradedByName(gradedBy != null ? gradedBy.getName() : null)
                .build();
    }
}
