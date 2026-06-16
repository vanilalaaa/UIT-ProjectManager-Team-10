package com.example.se330.service;

import com.example.se330.dto.submission.UpdateSubmissionRequest;
import com.example.se330.entity.Group;
import com.example.se330.entity.Project;
import com.example.se330.entity.Submission;
import com.example.se330.entity.User;
import com.example.se330.enums.SubmissionStatus;
import com.example.se330.repository.GroupRepository;
import com.example.se330.repository.ProjectRepository;
import com.example.se330.repository.SubmissionRepository;
import com.example.se330.repository.UserRepository;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProjectRepository projectRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/submissions/";
    private static final int MAX_FILES = 5;
    private static final long MAX_TOTAL_SIZE = 50L * 1024L * 1024L;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "docx", "zip", "rar");

    public List<Submission> getByProject(Long projectId) {
        return submissionRepository.findByProject_Id(projectId);
    }

    public List<Submission> createSubmission(Long projectId, Long groupId, List<MultipartFile> files, Long userId) throws IOException {
        validateFiles(files);

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
        Files.createDirectories(uploadPath);

        String uniqueFolder = "group_" + group.getId() + "_" + System.currentTimeMillis();
        Path submissionFolder = uploadPath.resolve(uniqueFolder);
        Files.createDirectories(submissionFolder);

        LocalDateTime submittedAt = LocalDateTime.now();
        Set<String> usedNames = new HashSet<>();
        List<Submission> submissions = files.stream().map(file -> {
            try {
                String storedFileName = storeSubmissionFile(file, submissionFolder, usedNames);
                return Submission.builder()
                        .filePath("/files/submissions/" + uniqueFolder + "/" + storedFileName)
                        .project(project)
                        .group(group)
                        .submittedBy(user)
                        .status(SubmissionStatus.SUBMITTED)
                        .submittedAt(submittedAt)
                        .build();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }).toList();

        return submissionRepository.saveAll(submissions);
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

    private void validateFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ít nhất một file.");
        }
        if (files.size() > MAX_FILES) {
            throw new IllegalArgumentException("Chỉ được nộp tối đa " + MAX_FILES + " file.");
        }

        long totalSize = files.stream().mapToLong(MultipartFile::getSize).sum();
        if (totalSize > MAX_TOTAL_SIZE) {
            throw new IllegalArgumentException("Tổng dung lượng file không được vượt quá 50MB.");
        }

        boolean hasInvalidType = files.stream()
                .map(file -> getExtension(file.getOriginalFilename()))
                .anyMatch(extension -> !ALLOWED_EXTENSIONS.contains(extension));
        if (hasInvalidType) {
            throw new IllegalArgumentException("Chỉ chấp nhận định dạng PDF, DOCX, ZIP hoặc RAR.");
        }
    }

    private String storeSubmissionFile(MultipartFile file, Path submissionFolder, Set<String> usedNames) throws IOException {
        String originalFileName = uniqueFileName(sanitizeFileName(file.getOriginalFilename()), usedNames);
        Path filePath = submissionFolder.resolve(originalFileName);
        file.transferTo(filePath.toFile());
        if (!Files.exists(filePath) || Files.size(filePath) != file.getSize()) {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        }
        if (!Files.exists(filePath)) {
            throw new IOException("Khong the luu file nop bai: " + originalFileName);
        }
        return originalFileName;
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "submission-file";
        }
        return Paths.get(fileName).getFileName().toString();
    }

    private String getExtension(String fileName) {
        String sanitizedName = sanitizeFileName(fileName);
        int dotIndex = sanitizedName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == sanitizedName.length() - 1) {
            return "";
        }
        return sanitizedName.substring(dotIndex + 1).toLowerCase();
    }

    private String uniqueFileName(String fileName, Set<String> usedNames) {
        if (usedNames.add(fileName)) {
            return fileName;
        }

        int dotIndex = fileName.lastIndexOf('.');
        String baseName = dotIndex > 0 ? fileName.substring(0, dotIndex) : fileName;
        String extension = dotIndex > 0 ? fileName.substring(dotIndex) : "";
        int counter = 2;

        while (true) {
            String candidate = baseName + "-" + counter + extension;
            if (usedNames.add(candidate)) {
                return candidate;
            }
            counter++;
        }
    }
}
