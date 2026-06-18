package com.example.se330.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;

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

    private static final String UPLOAD_DIR = "uploads/requirements/";

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
        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String folder = "course_" + courseId + "_" + System.currentTimeMillis();
        Path dir = uploadPath.resolve(folder);
        Files.createDirectories(dir);

        String name = file.getOriginalFilename();
        Files.copy(file.getInputStream(), dir.resolve(name), StandardCopyOption.REPLACE_EXISTING);

        return baseUrl + "/files/requirements/" + folder + "/" + name;
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
                .url(f.getUrl())
                .build();
    }
}
