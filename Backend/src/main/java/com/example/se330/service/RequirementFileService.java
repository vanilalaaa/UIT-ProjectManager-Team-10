package com.example.se330.service;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.se330.dto.requirement.RequirementFileResponse;
import com.example.se330.entity.Course;
import com.example.se330.entity.RequirementFile;
import com.example.se330.entity.RequirementSubmissionRequirement;
import com.example.se330.entity.RubricCriterion;
import com.example.se330.repository.CourseRepository;
import com.example.se330.repository.RequirementFileRepository;
import com.example.se330.repository.RequirementSubmissionRequirementRepository;
import com.example.se330.repository.RubricCriterionRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RequirementFileService {

    private final RequirementFileRepository fileRepository;
    private final CourseRepository courseRepository;
    private final RubricCriterionRepository criterionRepository;
    private final RequirementSubmissionRequirementRepository submissionRequirementRepository;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final String FILES_PREFIX = "/files/requirements/";

    @Transactional(readOnly = true)
    public List<RequirementFileResponse> list(Long courseId) {
        return fileRepository.findByCourse_IdOrderByIdDesc(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RequirementFileResponse> listByCriterion(Long courseId, Long criterionId) {
        return fileRepository.findByCourse_IdAndCriterion_IdOrderByIdDesc(courseId, criterionId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RequirementFileResponse> listBySubmissionRequirement(Long courseId, Long submissionRequirementId) {
        return fileRepository.findByCourse_IdAndSubmissionRequirement_IdOrderByIdDesc(courseId, submissionRequirementId).stream()
                .map(this::toResponse)
                .toList();
    }

    public RequirementFileResponse add(
            Long courseId,
            Long criterionId,
            Long submissionRequirementId,
            String label,
            MultipartFile file,
            Long teacherId)
            throws IOException {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lớp học."));
        assertLecturer(course, teacherId);
        if (criterionId != null && submissionRequirementId != null) {
            throw new IllegalArgumentException("Chỉ được gắn tệp với một loại yêu cầu.");
        }
        RubricCriterion criterion = criterionId != null ? loadCriterion(courseId, criterionId) : null;
        RequirementSubmissionRequirement submissionRequirement = submissionRequirementId != null
                ? loadSubmissionRequirement(courseId, submissionRequirementId)
                : null;

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Chưa chọn tệp để tải lên.");
        }
        String url = storeFile(courseId, file);
        String resolvedLabel = (label == null || label.isBlank()) ? file.getOriginalFilename() : label;

        RequirementFile saved = fileRepository.save(RequirementFile.builder()
                .course(course)
                .criterion(criterion)
                .submissionRequirement(submissionRequirement)
                .label(resolvedLabel)
                .url(url)
                .createdAt(LocalDateTime.now())
                .build());
        return toResponse(saved);
    }

    public RequirementFileResponse addLink(
            Long courseId,
            Long criterionId,
            Long submissionRequirementId,
            String label,
            String url,
            Long teacherId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lớp học."));
        assertLecturer(course, teacherId);
        if (criterionId != null && submissionRequirementId != null) {
            throw new IllegalArgumentException("Chỉ được gắn liên kết với một loại yêu cầu.");
        }
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("Chưa nhập liên kết.");
        }

        RubricCriterion criterion = criterionId != null ? loadCriterion(courseId, criterionId) : null;
        RequirementSubmissionRequirement submissionRequirement = submissionRequirementId != null
                ? loadSubmissionRequirement(courseId, submissionRequirementId)
                : null;
        String resolvedUrl = normalizeUrl(url.trim());
        String resolvedLabel = (label == null || label.isBlank()) ? resolvedUrl : label.trim();

        RequirementFile saved = fileRepository.save(RequirementFile.builder()
                .course(course)
                .criterion(criterion)
                .submissionRequirement(submissionRequirement)
                .label(resolvedLabel)
                .url(resolvedUrl)
                .createdAt(LocalDateTime.now())
                .build());
        return toResponse(saved);
    }

    public void delete(Long courseId, Long fileId, Long teacherId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lớp học."));
        assertLecturer(course, teacherId);

        RequirementFile f = fileRepository.findById(fileId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tệp."));
        if (f.getCourse() == null || !f.getCourse().getId().equals(courseId)) {
            throw new RuntimeException("Tệp không thuộc lớp này.");
        }
        fileRepository.delete(f);
    }

    @Transactional(readOnly = true)
    public RequirementFileDownload download(Long courseId, Long fileId) {
        RequirementFile f = fileRepository.findById(fileId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tệp."));
        if (f.getCourse() == null || !f.getCourse().getId().equals(courseId)) {
            throw new RuntimeException("Tệp không thuộc lớp này.");
        }
        if (!isLocalRequirementFileUrl(f.getUrl())) {
            throw new IllegalArgumentException("Tài liệu này là liên kết ngoài, không phải file trên server.");
        }

        Path filePath = resolveStoredRequirementFile(f.getUrl());
        if (!Files.exists(filePath) || !Files.isRegularFile(filePath)) {
            throw new EntityNotFoundException("File không còn tồn tại trên server.");
        }

        String fileName = f.getLabel() == null || f.getLabel().isBlank()
                ? filePath.getFileName().toString()
                : f.getLabel();
        return new RequirementFileDownload(new FileSystemResource(filePath), fileName);
    }

    private void assertLecturer(Course course, Long teacherId) {
        if (course.getLecturer() == null || !course.getLecturer().getId().equals(teacherId)) {
            throw new RuntimeException("Bạn không phải giảng viên của lớp này.");
        }
    }

    private RubricCriterion loadCriterion(Long courseId, Long criterionId) {
        RubricCriterion criterion = criterionRepository.findById(criterionId)
                .orElseThrow(() -> new EntityNotFoundException("KhÃ´ng tÃ¬m tháº¥y tiÃªu chÃ­."));
        if (criterion.getRequirement() == null
                || criterion.getRequirement().getCourse() == null
                || !criterion.getRequirement().getCourse().getId().equals(courseId)) {
            throw new RuntimeException("TiÃªu chÃ­ khÃ´ng thuá»™c lá»›p nÃ y.");
        }
        return criterion;
    }

    private RequirementSubmissionRequirement loadSubmissionRequirement(Long courseId, Long submissionRequirementId) {
        RequirementSubmissionRequirement submissionRequirement = submissionRequirementRepository.findById(submissionRequirementId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy yêu cầu nộp bài."));
        if (submissionRequirement.getRequirement() == null
                || submissionRequirement.getRequirement().getCourse() == null
                || !submissionRequirement.getRequirement().getCourse().getId().equals(courseId)) {
            throw new RuntimeException("Yêu cầu nộp bài không thuộc lớp này.");
        }
        return submissionRequirement;
    }

    private String storeFile(Long courseId, MultipartFile file) throws IOException {
        Path uploadPath = getRequirementUploadRoot();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String folder = "course_" + courseId + "_" + System.currentTimeMillis();
        Path dir = uploadPath.resolve(folder);
        Files.createDirectories(dir);

        String name = safeStoredFileName(file.getOriginalFilename());
        Files.copy(file.getInputStream(), dir.resolve(name), StandardCopyOption.REPLACE_EXISTING);

        return baseUrl + "/files/requirements/" + folder + "/" + encodePathSegment(name);
    }

    private Path getRequirementUploadRoot() {
        Path cwd = Paths.get("").toAbsolutePath().normalize();
        Path backendDir = cwd.getFileName() != null
                && "Backend".equalsIgnoreCase(cwd.getFileName().toString())
                        ? cwd
                        : cwd.resolve("Backend");
        return backendDir.resolve("uploads").resolve("requirements").normalize();
    }

    private Path resolveStoredRequirementFile(String url) {
        Path uploadRoot = getRequirementUploadRoot();
        Path resolved = uploadRoot.resolve(decodeLocalRequirementPath(extractRequirementRelativePath(url))).normalize();
        if (!resolved.startsWith(uploadRoot)) {
            throw new IllegalArgumentException("Đường dẫn file không hợp lệ.");
        }
        return resolved;
    }

    private String downloadUrl(RequirementFile f) {
        Long courseId = f.getCourse() != null ? f.getCourse().getId() : null;
        return baseUrl + "/api/courses/" + courseId + "/requirement/files/" + f.getId() + "/download";
    }

    private boolean isLocalRequirementFileUrl(String url) {
        return url != null && (
                url.startsWith(baseUrl + FILES_PREFIX)
                        || url.startsWith(FILES_PREFIX)
                        || url.contains(FILES_PREFIX));
    }

    private String extractRequirementRelativePath(String url) {
        int prefixIndex = url.indexOf(FILES_PREFIX);
        if (prefixIndex < 0) {
            throw new IllegalArgumentException("Đường dẫn file không hợp lệ.");
        }
        return url.substring(prefixIndex + FILES_PREFIX.length());
    }

    private Path decodeLocalRequirementPath(String relativePath) {
        Path decoded = Paths.get("");
        for (String segment : relativePath.split("/")) {
            if (segment.isEmpty()) {
                continue;
            }
            decoded = decoded.resolve(decodePathSegment(segment));
        }
        return decoded;
    }

    private String decodePathSegment(String value) {
        try {
            return URLDecoder.decode(value, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException ignored) {
            return value;
        }
    }

    private String safeStoredFileName(String fileName) {
        String original = fileName == null || fileName.isBlank()
                ? "requirement-file"
                : Paths.get(fileName).getFileName().toString();
        int dotIndex = original.lastIndexOf('.');
        String baseName = dotIndex > 0 ? original.substring(0, dotIndex) : original;
        String extension = dotIndex > 0 ? original.substring(dotIndex) : "";
        String safeBase = baseName
                .replaceAll("[^A-Za-z0-9._-]+", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_+|_+$", "");
        if (safeBase.isBlank()) {
            safeBase = "requirement-file";
        }
        return System.currentTimeMillis() + "_" + safeBase + extension.toLowerCase();
    }

    private String encodeLocalFileUrl(String url) {
        if (url == null || !url.startsWith(baseUrl + "/files/")) {
            return url;
        }
        String path = url.substring(baseUrl.length());
        StringBuilder encodedPath = new StringBuilder();
        for (String segment : path.split("/")) {
            if (segment.isEmpty()) {
                continue;
            }
            encodedPath.append('/').append(encodePathSegment(segment));
        }
        return baseUrl + encodedPath;
    }

    private String encodePathSegment(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private String normalizeUrl(String url) {
        if (url.matches("(?i)^https?://.+")) {
            return url;
        }
        return "https://" + url;
    }

    private RequirementFileResponse toResponse(RequirementFile f) {
        return RequirementFileResponse.builder()
                .id(f.getId())
                .criterionId(f.getCriterion() != null ? f.getCriterion().getId() : null)
                .submissionRequirementId(
                        f.getSubmissionRequirement() != null ? f.getSubmissionRequirement().getId() : null)
                .label(f.getLabel())
                .url(isLocalRequirementFileUrl(f.getUrl()) ? downloadUrl(f) : f.getUrl())
                .build();
    }

    public record RequirementFileDownload(Resource resource, String fileName) {
    }
}
