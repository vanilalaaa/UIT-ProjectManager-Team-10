package com.example.se330.service;

import com.example.se330.dto.task.CreateTaskRequest;
import com.example.se330.dto.task.UpdateTaskRequest;
import com.example.se330.entity.Group;
import com.example.se330.entity.Project;
import com.example.se330.entity.Task;
import com.example.se330.entity.User;
import com.example.se330.enums.Role;
import com.example.se330.enums.TaskStatus;
import com.example.se330.repository.ProjectRepository;
import com.example.se330.repository.TaskRepository;
import com.example.se330.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    // =========================
    // GET TASKS (FILTER)
    // =========================
    public List<Task> getProjectTasks(
            Long projectId,
            Long assigneeId,
            TaskStatus status
    ) {

        if (assigneeId != null && status != null) {
            return taskRepository
                    .findByProject_IdAndAssignedTo_IdAndStatus(
                            projectId, assigneeId, status
                    );
        }

        if (assigneeId != null) {
            return taskRepository
                    .findByProject_IdAndAssignedTo_Id(
                            projectId, assigneeId
                    );
        }

        if (status != null) {
            return taskRepository
                    .findByProject_IdAndStatus(
                            projectId, status
                    );
        }

        return taskRepository.findByProject_Id(projectId);
    }

    // =========================
    // CREATE TASK
    // =========================
    public Task createTask(
            Long projectId,
            CreateTaskRequest request,
            Long currentUserId
    ) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Project not found"));

        User createdBy = userRepository.findById(currentUserId)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found"));

        User assignedUser = null;

        if (request.getAssignedToId() != null) {
            assignedUser = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() ->
                            new EntityNotFoundException("Assigned user not found"));
        }

        // validate deadline
        if (request.getDeadline() != null &&
                request.getDeadline().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Deadline must be greater than now");
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null
                        ? request.getStatus()
                        : TaskStatus.TODO)
                .deadline(request.getDeadline())
                .assignedTo(assignedUser)
                .createdBy(createdBy)
                .project(project)
                .createdAt(LocalDateTime.now())
                .build();

        return taskRepository.save(task);
    }

    // =========================
    // UPDATE TASK
    // =========================
    public Task updateTask(
            Long taskId,
            UpdateTaskRequest request
    ) {

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Task not found"));

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

            User assignedUser = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() ->
                            new EntityNotFoundException("Assigned user not found"));

            task.setAssignedTo(assignedUser);
        }

        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    // =========================
    // UPDATE STATUS (KANBAN)
    // =========================
    public Task updateTaskStatus(
            Long taskId,
            TaskStatus status
    ) {

        if (status == null) {
            throw new RuntimeException("Status cannot be null");
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Task not found"));

        task.setStatus(status);
        task.setUpdatedAt(LocalDateTime.now());

        return taskRepository.save(task);
    }

    // =========================
    // DELETE TASK (LEADER ONLY)
    // =========================
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
}