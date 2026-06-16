package com.example.se330.service;

import com.example.se330.dto.submission.UpdateSubmissionRequest;
import com.example.se330.entity.*;
import com.example.se330.enums.SubmissionStatus;
import com.example.se330.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProjectRepository projectRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    private final String UPLOAD_DIR = "uploads/submissions/";

    public List<Submission> getByProject(Long projectId) {
        return submissionRepository.findByProject_Id(projectId);
    }

    public Submission createSubmission(Long projectId, Long groupId, MultipartFile file, Long userId) throws IOException {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy project"));

        if (isSubmissionLocked(project)) {
            throw new IllegalStateException("Đã hết hạn nộp bài. Bài nộp đã bị khóa.");
        }

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhóm"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy người dùng"));

        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String uniqueFolder = "group_" + group.getId() + "_" + System.currentTimeMillis();
        Path submissionFolder = uploadPath.resolve(uniqueFolder);
        
        if (!Files.exists(submissionFolder)) {
            Files.createDirectories(submissionFolder);
        }

        String originalFileName = file.getOriginalFilename();
        Path filePath = submissionFolder.resolve(originalFileName);
        
        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            e.printStackTrace(); 
            throw new IOException("Lỗi không thể lưu file vào ổ cứng: " + e.getMessage());
        }

        Submission submission = Submission.builder()
                .filePath("/files/submissions/" + uniqueFolder + "/" + originalFileName)
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

        if (request.getFilePath() != null) sub.setFilePath(request.getFilePath());
        if (request.getStatus() != null) sub.setStatus(request.getStatus());

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
        if (project.isSubmissionLocked()) return true;
        LocalDate endDate = project.getEndDate();
        return endDate != null && LocalDateTime.now().isAfter(endDate.atTime(LocalTime.MAX));
    }
}