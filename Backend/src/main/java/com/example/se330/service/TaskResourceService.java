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

import com.example.se330.dto.task.TaskResourceResponse;
import com.example.se330.entity.GroupMember;
import com.example.se330.entity.Task;
import com.example.se330.entity.TaskResource;
import com.example.se330.entity.User;
import com.example.se330.enums.GroupMemberStatus;
import com.example.se330.enums.Role;
import com.example.se330.repository.GroupMemberRepository;
import com.example.se330.repository.TaskResourceRepository;
import com.example.se330.repository.TaskRepository;
import com.example.se330.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskResourceService {

    private final TaskResourceRepository resourceRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final String UPLOAD_DIR = "uploads/tasks/";

    @Transactional(readOnly = true)
    public List<TaskResourceResponse> list(Long taskId) {
        return resourceRepository.findByTask_IdOrderByIdDesc(taskId).stream()
                .map(this::toResponse)
                .toList();
    }

    public TaskResourceResponse addLink(Long taskId, String type, String label, String url, Long currentUserId) {
        assertCanEdit(taskId, currentUserId);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        String resolvedType = (type == null || type.isBlank()) ? "LINK" : type.toUpperCase();
        String resolvedLabel = (label == null || label.isBlank()) ? url : label;
        String resolvedUrl = (url == null || url.isBlank())
                ? null : url;
        if (resolvedUrl == null) {
            throw new IllegalArgumentException("Thiếu đường dẫn tài nguyên.");
        }

        TaskResource saved = resourceRepository.save(TaskResource.builder()
                .task(task)
                .type(resolvedType)
                .label(resolvedLabel)
                .url(resolvedUrl)
                .createdAt(LocalDateTime.now())
                .build());

        return toResponse(saved);
    }

    public TaskResourceResponse addFile(Long taskId, MultipartFile file, Long currentUserId) throws IOException {
        assertCanEdit(taskId, currentUserId);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Chưa chọn tệp để tải lên.");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        String resolvedUrl = storeFile(taskId, file);
        String resolvedLabel = file.getOriginalFilename();

        TaskResource saved = resourceRepository.save(TaskResource.builder()
                .task(task)
                .type("FILE")
                .label(resolvedLabel)
                .url(resolvedUrl)
                .createdAt(LocalDateTime.now())
                .build());

        return toResponse(saved);
    }

    public void delete(Long taskId, Long resourceId, Long currentUserId) {
        assertCanEdit(taskId, currentUserId);

        TaskResource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found"));

        if (resource.getTask() == null || !resource.getTask().getId().equals(taskId)) {
            throw new RuntimeException("Tài nguyên không thuộc task này.");
        }

        // Xóa file vật lý nếu là FILE
        if ("FILE".equals(resource.getType()) && resource.getUrl() != null) {
            try {
                Path filePath = Paths.get(resource.getUrl().replace(baseUrl + "/", ""));
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // log warning nhưng không chặn xóa DB
            }
        }

        resourceRepository.delete(resource);
    }

    // Leader/Validator/Assigned/ADMIN mới được thêm/xóa resource
    private void assertCanEdit(Long taskId, Long currentUserId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (currentUser.getRole() == Role.ADMIN) {
            return;
        }

        boolean isLeader = task.getGroup() != null
                && task.getGroup().getLeader() != null
                && task.getGroup().getLeader().getId().equals(currentUser.getId());
        boolean isValidator = task.getValidator() != null
                && task.getValidator().getId().equals(currentUser.getId());
        boolean isAssigned = task.getAssignedTo() != null
                && task.getAssignedTo().getId().equals(currentUser.getId());

        if (!isLeader && !isValidator && !isAssigned) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa tài nguyên của task này.");
        }
    }

    private String storeFile(Long taskId, MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String folder = "task_" + taskId + "_" + System.currentTimeMillis();
        Path dir = uploadPath.resolve(folder);
        Files.createDirectories(dir);

        String name = file.getOriginalFilename();
        Files.copy(file.getInputStream(), dir.resolve(name), StandardCopyOption.REPLACE_EXISTING);

        return baseUrl + "/files/" + folder + "/" + name;
    }

    private TaskResourceResponse toResponse(TaskResource r) {
        return TaskResourceResponse.builder()
                .id(r.getId())
                .type(r.getType())
                .label(r.getLabel())
                .url(r.getUrl())
                .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null)
                .build();
    }
}
