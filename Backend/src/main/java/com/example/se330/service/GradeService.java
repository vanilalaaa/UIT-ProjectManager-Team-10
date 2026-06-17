
package com.example.se330.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.se330.dto.grade.CreateGradeRequest;
import com.example.se330.dto.grade.CriterionScoreRequest;
import com.example.se330.dto.grade.CriterionScoreResponse;
import com.example.se330.dto.grade.GradeResponse;
import com.example.se330.dto.grade.UpdateGradeRequest;
import com.example.se330.entity.Grade;
import com.example.se330.entity.GradeCriterionScore;
import com.example.se330.entity.Project;
import com.example.se330.entity.Submission;
import com.example.se330.entity.User;
import com.example.se330.enums.ProjectStatus;
import com.example.se330.enums.SubmissionStatus;
import com.example.se330.repository.GradeRepository;
import com.example.se330.repository.GroupMemberRepository;
import com.example.se330.repository.ProjectRepository;
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
    private final ProjectRepository projectRepository;

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
                .feedback(request.getFeedback())
                .gradedBy(teacher)
                .gradedAt(LocalDateTime.now())
                .build();

        applyCriterionScores(grade, request.getCriterionScores(),
                request.getScore(), request.getMaxScore());

        submission.setStatus(SubmissionStatus.GRADED);
        submissionRepository.save(submission);

        // Đã chấm xong → đồ án của nhóm chuyển từ IN_PROGRESS sang GRADED.
        Project project = submission.getProject();
        if (project != null) {
            project.setStatus(ProjectStatus.GRADED);
            projectRepository.save(project);
        }

        return toResponse(gradeRepository.save(grade));
    }


    public GradeResponse updateGrade(Long gradeId, UpdateGradeRequest request) {

        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy điểm"));

        if (request.getFeedback() != null) {
            grade.setFeedback(request.getFeedback());
        }

        if (request.getCriterionScores() != null) {
            // Thay thế toàn bộ điểm chi tiết -> tính lại score/maxScore tổng.
            applyCriterionScores(grade, request.getCriterionScores(),
                    grade.getScore(), grade.getMaxScore());
        } else {
            if (request.getScore() != null) {
                grade.setScore(request.getScore());
            }
            if (request.getMaxScore() != null) {
                grade.setMaxScore(request.getMaxScore());
            }
        }
        grade.setGradedAt(LocalDateTime.now());

        return toResponse(gradeRepository.save(grade));
    }

    // Gắn danh sách điểm chi tiết vào grade và tính score/maxScore tổng = tổng các tiêu chí.
    // Nếu không có chi tiết, giữ điểm tổng theo fallback (giá trị gửi lên / điểm hiện tại).
    private void applyCriterionScores(Grade grade, List<CriterionScoreRequest> reqScores,
            Integer fallbackScore, Integer fallbackMaxScore) {

        grade.getCriterionScores().clear();

        if (reqScores == null || reqScores.isEmpty()) {
            grade.setScore(fallbackScore);
            grade.setMaxScore(fallbackMaxScore);
            return;
        }

        int totalScore = 0;
        int totalMaxScore = 0;
        for (CriterionScoreRequest cs : reqScores) {
            grade.getCriterionScores().add(GradeCriterionScore.builder()
                    .grade(grade)
                    .criterionId(cs.getCriterionId())
                    .criterionName(cs.getName())
                    .maxScore(cs.getMaxScore())
                    .score(cs.getScore())
                    .note(cs.getNote())
                    .build());
            totalScore += cs.getScore() != null ? cs.getScore() : 0;
            totalMaxScore += cs.getMaxScore() != null ? cs.getMaxScore() : 0;
        }
        grade.setScore(totalScore);
        grade.setMaxScore(totalMaxScore);
    }

    @Transactional(readOnly = true)
    public GradeResponse getBySubmission(Long submissionId) {
        return gradeRepository.findBySubmission_Id(submissionId)
                .map(this::toResponse)
                .orElse(null);
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

        List<CriterionScoreResponse> criterionScores = new ArrayList<>();
        if (grade.getCriterionScores() != null) {
            for (GradeCriterionScore cs : grade.getCriterionScores()) {
                criterionScores.add(CriterionScoreResponse.builder()
                        .criterionId(cs.getCriterionId())
                        .name(cs.getCriterionName())
                        .maxScore(cs.getMaxScore())
                        .score(cs.getScore())
                        .note(cs.getNote())
                        .build());
            }
        }

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
                .criterionScores(criterionScores)
                .build();
    }
}
