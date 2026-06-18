package com.example.se330.service;

import com.example.se330.dto.submission.UpdateSubmissionRequest;
import com.example.se330.entity.Group;
import com.example.se330.entity.Project;
import com.example.se330.entity.Submission;
import com.example.se330.entity.User;
import com.example.se330.repository.GroupRepository;
import com.example.se330.repository.ProjectRepository;
import com.example.se330.repository.RequirementSubmissionRequirementRepository;
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
import java.util.ArrayList;
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
    private final RequirementSubmissionRequirementRepository submissionRequirementRepository;
    private final UserRepository userRepository;
    private final ProjectStatusService projectStatusService;

    private static final int MAX_FILES = 5;
    private static final long MAX_TOTAL_SIZE = 50L * 1024L * 1024L;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "docx", "zip", "rar");

    public List<Submission> getByProject(Long projectId) {
        return submissionRepository.findByProject_Id(projectId);
    }

    public List<Submission> createSubmission(
            Long projectId,
            Long groupId,
            Long submissionRequirementId,
            List<MultipartFile> files,
            String linkUrl,
            String linkLabel,
            Long userId) throws IOException {
        boolean hasFiles = files != null && !files.isEmpty();
        boolean hasLink = linkUrl != null && !linkUrl.isBlank();
        if (!hasFiles && !hasLink) {
            throw new IllegalArgumentException("Vui long chon it nhat mot file hoac nhap link nop bai.");
        }
        if (hasFiles) {
            validateFiles(files);
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay project"));

        if (refreshSubmissionLock(project)) {
            throw new IllegalStateException("Da het han nop bai. Bai nop da bi khoa.");
        }

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay nhom"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay nguoi dung"));

        if (submissionRequirementId != null) {
            boolean belongsToCourse = submissionRequirementRepository.findById(submissionRequirementId)
                    .map(item -> item.getRequirement() != null
                            && item.getRequirement().getCourse() != null
                            && project.getCourse() != null
                            && item.getRequirement().getCourse().getId().equals(project.getCourse().getId()))
                    .orElse(false);
            if (!belongsToCourse) {
                throw new IllegalArgumentException("Yeu cau nop bai khong thuoc lop cua do an nay.");
            }
        }

        Path uploadPath = getSubmissionUploadRoot();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String uniqueFolder = "group_" + group.getId() + "_" + System.currentTimeMillis();
        Path submissionFolder = uploadPath.resolve(uniqueFolder);
        if (!Files.exists(submissionFolder)) {
            Files.createDirectories(submissionFolder);
        }

        LocalDateTime submittedAt = LocalDateTime.now();
        Set<String> usedNames = new HashSet<>();
        List<Submission> submissions = new ArrayList<>();

        if (hasFiles) {
            submissions.addAll(files.stream().map(file -> {
                try {
                    String storedFileName = storeSubmissionFile(file, submissionFolder, usedNames);
                    return Submission.builder()
                            .filePath("/files/submissions/" + uniqueFolder + "/" + storedFileName)
                            .submissionRequirementId(submissionRequirementId)
                            .project(project)
                            .group(group)
                            .submittedBy(user)
                            .submittedAt(submittedAt)
                            .build();
                } catch (IOException e) {
                    throw new RuntimeException("Loi luu tep tin: " + e.getMessage(), e);
                }
            }).toList());
        }

        if (hasLink) {
            String resolvedLinkUrl = normalizeUrl(linkUrl.trim());
            String resolvedLinkLabel = linkLabel == null || linkLabel.isBlank()
                    ? resolvedLinkUrl
                    : linkLabel.trim();
            submissions.add(Submission.builder()
                    .filePath(resolvedLinkUrl)
                    .label(resolvedLinkLabel)
                    .submissionRequirementId(submissionRequirementId)
                    .project(project)
                    .group(group)
                    .submittedBy(user)
                    .submittedAt(submittedAt)
                    .build());
        }

        List<Submission> savedSubmissions = submissionRepository.saveAll(submissions);
        projectStatusService.refresh(project);
        return savedSubmissions;
    }

    public Submission updateSubmission(Long id, UpdateSubmissionRequest request) {
        Submission sub = submissionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay bai nop"));

        if (request.getFilePath() != null) {
            sub.setFilePath(request.getFilePath());
        }

        return submissionRepository.save(sub);
    }

    public void deleteSubmission(Long id) {
        Submission sub = submissionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Khong tim thay bai nop"));
        Project project = sub.getProject();
        submissionRepository.delete(sub);
        submissionRepository.flush();
        projectStatusService.refresh(project);
    }

    public boolean isSubmissionLocked(Project project) {
        return shouldLockSubmission(project);
    }

    public boolean refreshSubmissionLock(Project project) {
        boolean locked = shouldLockSubmission(project);
        if (project.isSubmissionLocked() != locked) {
            project.setSubmissionLocked(locked);
            projectRepository.save(project);
        }
        return locked;
    }

    private boolean shouldLockSubmission(Project project) {
        if (project == null) return true;
        LocalDate endDate = project.getEndDate();
        return endDate != null && LocalDateTime.now().isAfter(endDate.atTime(LocalTime.MAX));
    }

    private Path getSubmissionUploadRoot() {
        Path cwd = Paths.get("").toAbsolutePath().normalize();
        Path backendDir = cwd.getFileName() != null
                && "Backend".equalsIgnoreCase(cwd.getFileName().toString())
                        ? cwd
                        : cwd.resolve("Backend");
        return backendDir.resolve("uploads").resolve("submissions").normalize();
    }

    private void validateFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("Vui long chon it nhat mot file.");
        }
        if (files.size() > MAX_FILES) {
            throw new IllegalArgumentException("Chi duoc nop toi da " + MAX_FILES + " file.");
        }

        long totalSize = files.stream().mapToLong(MultipartFile::getSize).sum();
        if (totalSize > MAX_TOTAL_SIZE) {
            throw new IllegalArgumentException("Tong dung luong file khong duoc vuot qua 50MB.");
        }

        boolean hasInvalidType = files.stream()
                .map(file -> getExtension(file.getOriginalFilename()))
                .anyMatch(extension -> !ALLOWED_EXTENSIONS.contains(extension));
        if (hasInvalidType) {
            throw new IllegalArgumentException("Chi chap nhan dinh dang PDF, DOCX, ZIP hoac RAR.");
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

    private String normalizeUrl(String url) {
        if (url.matches("(?i)^https?://.+")) {
            return url;
        }
        return "https://" + url;
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
