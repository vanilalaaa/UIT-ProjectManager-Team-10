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
import com.example.se330.entity.Notification;
import com.example.se330.entity.Project;
import com.example.se330.entity.Task;
import com.example.se330.entity.User;
import com.example.se330.enums.GroupMemberStatus;
import com.example.se330.enums.Role;
import com.example.se330.enums.TaskStatus;
import com.example.se330.repository.GroupMemberRepository;
import com.example.se330.repository.GroupRepository;
import com.example.se330.repository.NotificationRepository;
import com.example.se330.repository.ProjectRepository;
import com.example.se330.repository.TaskRepository;
import com.example.se330.repository.TaskResourceRepository;
import com.example.se330.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
    private final NotificationRepository notificationRepository;

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

        TaskStatus oldStatus = task.getStatus();

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            // Task đang chờ kiểm tra (REVIEW) → chỉ leader/validator/admin được duyệt
            // hoặc trả lại để chỉnh sửa; người thực hiện chỉ được gửi đi kiểm tra.
            if (oldStatus == TaskStatus.REVIEW && request.getStatus() != TaskStatus.REVIEW
                    && !isLeader && !isValidator && !isAdmin) {
                throw new RuntimeException("Chỉ leader hoặc người kiểm tra mới được duyệt/từ chối task đang chờ kiểm tra.");
            }
            task.setStatus(request.getStatus());
        }
        if (request.getDeadline() != null) {
            if (request.getDeadline().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Deadline must be greater than now");
            }
            task.setDeadline(request.getDeadline());
        }
        // id = 0 là quy ước "gỡ bỏ" (id thật bắt đầu từ 1) vì null = "không đổi".
        if (request.getAssignedToId() != null) {
            if (!isLeader && !isAdmin) {
                throw new RuntimeException("Chỉ leader mới được thay đổi người thực hiện task.");
            }
            if (request.getAssignedToId() == 0L) {
                task.setAssignedTo(null);
            } else {
                User assignedUser = userRepository.findById(request.getAssignedToId())
                        .orElseThrow(() -> new EntityNotFoundException("Assigned user not found"));
                task.setAssignedTo(assignedUser);
            }
        }
        if (request.getValidatorId() != null) {
            if (!isLeader && !isAdmin) {
                throw new RuntimeException("Chỉ leader mới được thay đổi người kiểm tra task.");
            }
            if (request.getValidatorId() == 0L) {
                task.setValidator(null);
            } else {
                User validator = userRepository.findById(request.getValidatorId())
                        .orElseThrow(() -> new EntityNotFoundException("Validator not found"));
                task.setValidator(validator);
            }
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

        Task saved = taskRepository.save(task);
        notifyTaskTransition(saved, oldStatus, currentUser);
        return toResponse(saved);
    }

    // Đổi trạng thái nhanh (kéo–thả Kanban). Cùng luật duyệt + thông báo như
    // updateTask để mọi lối đổi trạng thái đều nhất quán.
    public TaskResponse updateTaskStatus(Long taskId, TaskStatus status, Long currentUserId) {

        if (status == null) {
            throw new RuntimeException("Status cannot be null");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        boolean isLeader = task.getGroup() != null
                && task.getGroup().getLeader() != null
                && task.getGroup().getLeader().getId().equals(currentUser.getId());
        boolean isValidator = task.getValidator() != null
                && task.getValidator().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        TaskStatus oldStatus = task.getStatus();
        if (oldStatus == TaskStatus.REVIEW && status != TaskStatus.REVIEW
                && !isLeader && !isValidator && !isAdmin) {
            throw new RuntimeException("Chỉ leader hoặc người kiểm tra mới được duyệt/từ chối task đang chờ kiểm tra.");
        }

        task.setStatus(status);
        task.setUpdatedAt(LocalDateTime.now());

        Task saved = taskRepository.save(task);
        notifyTaskTransition(saved, oldStatus, currentUser);
        return toResponse(saved);
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

    // Thông báo theo chuyển trạng thái của task:
    //  - chuyển sang REVIEW  → báo người kiểm tra + leader (task chờ duyệt)
    //  - REVIEW → DONE       → báo người thực hiện (đã được duyệt, kèm nhận xét)
    //  - REVIEW → IN_PROGRESS/TODO → báo người thực hiện (cần chỉnh sửa, kèm nhận xét)
    private void notifyTaskTransition(Task task, TaskStatus oldStatus, User actor) {
        TaskStatus newStatus = task.getStatus();
        if (newStatus == null || newStatus == oldStatus) {
            return;
        }

        Project project = task.getProject();
        Long projectId = project != null ? project.getId() : null;
        Long courseId = project != null && project.getCourse() != null ? project.getCourse().getId() : null;
        String taskTitle = task.getTitle();
        String actorName = actor != null ? actor.getName() : "Thành viên";
        String review = task.getComment();

        if (newStatus == TaskStatus.REVIEW) {
            User leader = task.getGroup() != null ? task.getGroup().getLeader() : null;
            notifyDistinct(Arrays.asList(task.getValidator(), leader), actor,
                    "TASK_REVIEW_REQUESTED",
                    "Task chờ kiểm tra: " + taskTitle,
                    actorName + " đã gửi task \"" + taskTitle + "\" để kiểm tra.",
                    courseId, projectId);
        } else if (oldStatus == TaskStatus.REVIEW && newStatus == TaskStatus.DONE) {
            notifyDistinct(Arrays.asList(task.getAssignedTo()), actor,
                    "TASK_APPROVED",
                    "Task đã được duyệt: " + taskTitle,
                    review != null && !review.isBlank() ? review
                            : actorName + " đã duyệt task \"" + taskTitle + "\" của bạn.",
                    courseId, projectId);
        } else if (oldStatus == TaskStatus.REVIEW
                && (newStatus == TaskStatus.IN_PROGRESS || newStatus == TaskStatus.TODO)) {
            notifyDistinct(Arrays.asList(task.getAssignedTo()), actor,
                    "TASK_REJECTED",
                    "Task cần chỉnh sửa: " + taskTitle,
                    review != null && !review.isBlank() ? review
                            : actorName + " yêu cầu chỉnh sửa lại task \"" + taskTitle + "\".",
                    courseId, projectId);
        }
    }

    // Gửi cùng một thông báo tới nhiều người, bỏ qua null, bỏ qua chính người thao tác
    // và không gửi trùng (leader trùng validator).
    private void notifyDistinct(List<User> recipients, User actor, String type, String title,
            String message, Long courseId, Long projectId) {
        Set<Long> seen = new HashSet<>();
        for (User recipient : recipients) {
            if (recipient == null) {
                continue;
            }
            if (actor != null && recipient.getId().equals(actor.getId())) {
                continue;
            }
            if (!seen.add(recipient.getId())) {
                continue;
            }
            notificationRepository.save(Notification.builder()
                    .recipient(recipient)
                    .type(type)
                    .title(title)
                    .message(message)
                    .courseId(courseId)
                    .projectId(projectId)
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build());
        }
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
