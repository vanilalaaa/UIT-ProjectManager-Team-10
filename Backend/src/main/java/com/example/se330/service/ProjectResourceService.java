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

import com.example.se330.dto.project.ProjectResourceResponse;
import com.example.se330.entity.Group;
import com.example.se330.entity.Project;
import com.example.se330.entity.ProjectResource;
import com.example.se330.entity.Registration;
import com.example.se330.enums.GroupMemberStatus;
import com.example.se330.enums.RegistrationStatus;
import com.example.se330.repository.GroupMemberRepository;
import com.example.se330.repository.ProjectRepository;
import com.example.se330.repository.ProjectResourceRepository;
import com.example.se330.repository.RegistrationRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectResourceService {

    private final ProjectResourceRepository resourceRepository;
    private final ProjectRepository projectRepository;
    private final RegistrationRepository registrationRepository;
    private final GroupMemberRepository groupMemberRepository;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final String UPLOAD_DIR = "uploads/resources/";

    @Transactional(readOnly = true)
    public List<ProjectResourceResponse> list(Long projectId) {
        return resourceRepository.findByProject_IdOrderByIdDesc(projectId).stream()
                .map(this::toResponse)
                .toList();
    }

    public ProjectResourceResponse add(Long projectId, String type, String label, String url, MultipartFile file,
            Long userId) throws IOException {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy đồ án."));
        assertActiveMember(projectId, userId);

        String resolvedType = (type == null || type.isBlank()) ? "LINK" : type.toUpperCase();
        String resolvedLabel = label;
        String resolvedUrl;

        if ("FILE".equals(resolvedType)) {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("Chưa chọn tệp để tải lên.");
            }
            resolvedUrl = storeFile(projectId, file);
            if (resolvedLabel == null || resolvedLabel.isBlank()) {
                resolvedLabel = file.getOriginalFilename();
            }
        } else {
            if (url == null || url.isBlank()) {
                throw new IllegalArgumentException("Thiếu đường dẫn tài nguyên.");
            }
            resolvedUrl = url;
            if (resolvedLabel == null || resolvedLabel.isBlank()) {
                resolvedLabel = url;
            }
        }

        ProjectResource saved = resourceRepository.save(ProjectResource.builder()
                .project(project)
                .type(resolvedType)
                .label(resolvedLabel)
                .url(resolvedUrl)
                .createdAt(LocalDateTime.now())
                .build());

        return toResponse(saved);
    }

    public void delete(Long projectId, Long resourceId, Long userId) {
        assertActiveMember(projectId, userId);
        ProjectResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tài nguyên."));
        if (resource.getProject() == null || !resource.getProject().getId().equals(projectId)) {
            throw new RuntimeException("Tài nguyên không thuộc đồ án này.");
        }
        resourceRepository.delete(resource);
    }

    // Chỉ thành viên ACTIVE của nhóm thực hiện đồ án (registration APPROVED) mới được thêm/xóa.
    private void assertActiveMember(Long projectId, Long userId) {
        Registration reg = registrationRepository
                .findFirstByProject_IdAndStatus(projectId, RegistrationStatus.APPROVED)
                .orElseThrow(() -> new RuntimeException("Đồ án chưa có nhóm thực hiện."));
        Group group = reg.getGroup();
        if (group == null) {
            throw new RuntimeException("Đồ án chưa có nhóm thực hiện.");
        }
        boolean isActiveMember = groupMemberRepository.findByGroupIdAndUserId(group.getId(), userId)
                .map(m -> m.getStatus() == GroupMemberStatus.ACTIVE)
                .orElse(false);
        if (!isActiveMember) {
            throw new RuntimeException("Bạn không phải thành viên nhóm thực hiện đồ án này.");
        }
    }

    private String storeFile(Long projectId, MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String folder = "project_" + projectId + "_" + System.currentTimeMillis();
        Path dir = uploadPath.resolve(folder);
        Files.createDirectories(dir);

        String name = file.getOriginalFilename();
        Files.copy(file.getInputStream(), dir.resolve(name), StandardCopyOption.REPLACE_EXISTING);

        // URL tuyệt đối để mở được trực tiếp (FE chạy ở origin khác BE).
        return baseUrl + "/files/resources/" + folder + "/" + name;
    }

    private ProjectResourceResponse toResponse(ProjectResource r) {
        return ProjectResourceResponse.builder()
                .id(r.getId())
                .type(r.getType())
                .label(r.getLabel())
                .url(r.getUrl())
                .build();
    }
}
