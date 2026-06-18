package com.example.se330.service;

import com.example.se330.dto.task.BoardGroupResponse;
import com.example.se330.dto.task.BoardResponse;
import com.example.se330.dto.task.CreateTaskRequest;
import com.example.se330.dto.task.TaskResponse;
import com.example.se330.dto.task.TaskResourceResponse;
import com.example.se330.dto.task.UpdateTaskRequest;
import com.example.se330.dto.task.UserLiteResponse;
import com.example.se330.entity.Group;
import com.example.se330.entity.GroupMember;
import com.example.se330.entity.Project;
import com.example.se330.entity.Task;
import com.example.se330.entity.User;
import com.example.se330.enums.GroupMemberStatus;
import com.example.se330.enums.Role;
import com.example.se330.enums.TaskStatus;
import com.example.se330.repository.GroupMemberRepository;
import com.example.se330.repository.GroupRepository;
import com.example.se330.repository.ProjectRepository;
import com.example.se330.repository.TaskRepository;
import com.example.se330.repository.TaskResourceRepository;
import com.example.se330.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final TaskResourceRepository taskResourceRepository;

    @Transactional(readOnly = true)
    public List<TaskResponse> getProjectTasks(Long projectId, Long assigneeId, TaskStatus status) {

        List<Task> tasks;
        if (assigneeId != null && status != null) {
            tasks = taskRepository.findByProject_IdAndAssignedTo_IdAndStatus(projectId, assigneeId, status);
        } else if (assigneeId != null) {
            tasks = taskRepository.findByProject_IdAndAssignedTo_Id(projectId, assigneeId);
        } else if (status != null) {
            tasks = taskRepository.findByProject_IdAndStatus(projectId, status);
        } else {
            tasks = taskRepository.findByProject_Id(projectId);
        }

        return tasks.stream().map(this::toResponse).toList();
    }

    // Dữ liệu 1 lần load Kanban: nhóm của user trong lớp của đồ án + task của nhóm.
    @Transactional(readOnly = true)
    public BoardResponse getBoard(Long projectId, Long currentUserId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Long courseId = project.getCourse() != null ? project.getCourse().getId() : null;

        GroupMember membership = courseId != null
                ? groupMemberRepository
                        .findFirstByUser_IdAndGroup_Course_IdAndStatus(
                                currentUserId, courseId, GroupMemberStatus.ACTIVE)
                        .orElse(null)
                : null;

        BoardGroupResponse groupResp = null;
        List<TaskResponse> tasks = List.of();

        if (membership != null && membership.getGroup() != null) {
            Group group = membership.getGroup();

            List<UserLiteResponse> members = group.getMembers().stream()
                    .filter(m -> m.getStatus() == GroupMemberStatus.ACTIVE && m.getUser() != null)
                    .map(m -> toUserLite(m.getUser()))
                    .toList();

            groupResp = BoardGroupResponse.builder()
                    .groupId(group.getId())
                    .name(group.getName())
                    .leaderId(group.getLeader() != null ? group.getLeader().getId() : null)
                    .members(members)
                    .build();

            tasks = taskRepository.findByProject_IdAndGroup_Id(projectId, group.getId())
                    .stream().map(this::toResponse).toList();
        }

        return BoardResponse.builder()
                .tasks(tasks)
                .currentUser(toUserLite(currentUser))
                .group(groupResp)
                .build();
    }

    public TaskResponse createTask(Long projectId, CreateTaskRequest request, Long currentUserId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        User createdBy = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        User assignedUser = null;
        if (request.getAssignedToId() != null) {
            assignedUser = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new EntityNotFoundException("Assigned user not found"));
        }

        Group group = null;
        if (request.getGroupId() != null) {
            group = groupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new EntityNotFoundException("Group not found"));
        }

        User validator = null;
        if (request.getValidatorId() != null) {
            validator = userRepository.findById(request.getValidatorId())
                    .orElseThrow(() -> new EntityNotFoundException("Validator not found"));
        }

        if (request.getDeadline() != null && request.getDeadline().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Deadline must be greater than now");
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .deadline(request.getDeadline())
                .assignedTo(assignedUser)
                .validator(validator)
                .source(request.getSource())
                .createdBy(createdBy)
                .group(group)
                .project(project)
                .createdAt(LocalDateTime.now())
                .build();

        return toResponse(taskRepository.save(task));
    }

    public TaskResponse updateTask(Long taskId, UpdateTaskRequest request, Long currentUserId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        boolean isLeader = task.getGroup() != null
                && task.getGroup().getLeader() != null
                && task.getGroup().getLeader().getId().equals(currentUser.getId());
        boolean isValidator = task.getValidator() != null
                && task.getValidator().getId().equals(currentUser.getId());
        boolean isAssigned = task.getAssignedTo() != null
                && task.getAssignedTo().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isAdmin && !isLeader && !isValidator && !isAssigned) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa task này.");
        }

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        if (request.getDeadline() != null) {
            if (request.getDeadline().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Deadline must be greater than now");
            }
            task.setDeadline(request.getDeadline());
        }
        if (request.getAssignedToId() != null) {
            if (!isLeader && !isAdmin) {
                throw new RuntimeException("Chỉ leader mới được thay đổi người thực hiện task.");
            }
            User assignedUser = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new EntityNotFoundException("Assigned user not found"));
            task.setAssignedTo(assignedUser);
        }
        if (request.getValidatorId() != null) {
            if (!isLeader && !isAdmin) {
                throw new RuntimeException("Chỉ leader mới được thay đổi người kiểm tra task.");
            }
            User validator = userRepository.findById(request.getValidatorId())
                    .orElseThrow(() -> new EntityNotFoundException("Validator not found"));
            task.setValidator(validator);
        }
        if (request.getSource() != null) {
            task.setSource(request.getSource());
        }
        if (request.getComment() != null) {
            if (!isLeader && !isValidator && !isAdmin) {
                throw new RuntimeException("Chỉ leader hoặc validator mới được thêm đánh giá cho task.");
            }
            task.setComment(request.getComment());
        }

        task.setUpdatedAt(LocalDateTime.now());

        return toResponse(taskRepository.save(task));
    }

    public TaskResponse updateTaskStatus(Long taskId, TaskStatus status) {

        if (status == null) {
            throw new RuntimeException("Status cannot be null");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        task.setStatus(status);
        task.setUpdatedAt(LocalDateTime.now());

        return toResponse(taskRepository.save(task));
    }

    // Leader của nhóm hoặc ADMIN mới được xóa.
    public void deleteTask(Long taskId, Long currentUserId) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (currentUser.getRole() == Role.ADMIN) {
            taskRepository.delete(task);
            return;
        }

        Group group = task.getGroup();
        if (group == null || group.getLeader() == null) {
            throw new RuntimeException("No permission");
        }
        if (!group.getLeader().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only leader can delete task");
        }

        taskRepository.delete(task);
    }

    private TaskResponse toResponse(Task task) {
        return TaskResponse.builder()
                .taskId(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus() != null ? task.getStatus().name() : null)
                .assignee(toUserLite(task.getAssignedTo()))
                .validator(toUserLite(task.getValidator()))
                .createdBy(toUserLite(task.getCreatedBy()))
                .groupId(task.getGroup() != null ? task.getGroup().getId() : null)
                .source(task.getSource())
                .resources(taskResourceRepository.findByTask_IdOrderByIdDesc(task.getId()).stream()
                        .map(r -> TaskResourceResponse.builder()
                                .id(r.getId())
                                .type(r.getType())
                                .label(r.getLabel())
                                .url(r.getUrl())
                                .createdAt(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null)
                                .build())
                        .toList())
                .deadline(task.getDeadline() != null ? task.getDeadline().toString() : null)
                .createdAt(task.getCreatedAt() != null ? task.getCreatedAt().toString() : null)
                .updatedAt(task.getUpdatedAt() != null ? task.getUpdatedAt().toString() : null)
                .comment(task.getComment())
                .build();
    }

    private UserLiteResponse toUserLite(User user) {
        if (user == null) {
            return null;
        }
        String avatar = user.getUserProfile() != null ? user.getUserProfile().getAvatarUrl() : null;
        return UserLiteResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .avatar(avatar)
                .build();
    }
}
