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
import com.example.se330.repository.CourseRepository;
import com.example.se330.repository.RequirementFileRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RequirementFileService {

    private final RequirementFileRepository fileRepository;
    private final CourseRepository courseRepository;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final String UPLOAD_DIR = "uploads/requirements/";

    @Transactional(readOnly = true)
    public List<RequirementFileResponse> list(Long courseId) {
        return fileRepository.findByCourse_IdOrderByIdDesc(courseId).stream()
                .map(this::toResponse)
                .toList();
    }

    public RequirementFileResponse add(Long courseId, String label, MultipartFile file, Long teacherId)
            throws IOException {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lớp học."));
        assertLecturer(course, teacherId);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Chưa chọn tệp để tải lên.");
        }
        String url = storeFile(courseId, file);
        String resolvedLabel = (label == null || label.isBlank()) ? file.getOriginalFilename() : label;

        RequirementFile saved = fileRepository.save(RequirementFile.builder()
                .course(course)
                .label(resolvedLabel)
                .url(url)
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

    private RequirementFileResponse toResponse(RequirementFile f) {
        return RequirementFileResponse.builder()
                .id(f.getId())
                .label(f.getLabel())
                .url(f.getUrl())
                .build();
    }
}
