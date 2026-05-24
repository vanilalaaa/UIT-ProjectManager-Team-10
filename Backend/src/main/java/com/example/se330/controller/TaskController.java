package com.example.se330.controller;

import com.example.se330.dto.task.CreateTaskRequest;
import com.example.se330.dto.task.UpdateTaskRequest;
import com.example.se330.dto.task.UpdateTaskStatusRequest;
import com.example.se330.entity.Task;
import com.example.se330.enums.TaskStatus;
import com.example.se330.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class TaskController {

    private final TaskService taskService;

    // GET /projects/:id/tasks
    @GetMapping("/projects/{id}/tasks")
    public List<Task> getProjectTasks(

            @PathVariable Long id,

            @RequestParam(required = false)
            Long assignee,

            @RequestParam(required = false)
            TaskStatus status
    ) {

        return taskService.getProjectTasks(
                id,
                assignee,
                status
        );
    }

    // POST /projects/:id/tasks
    @PostMapping("/projects/{id}/tasks")
    public Task createTask(

            @PathVariable Long id,

            @Valid
            @RequestBody
            CreateTaskRequest request
    ) {

        Long currentUserId = 1L;

        return taskService.createTask(
                id,
                request,
                currentUserId
        );
    }

    // PUT /tasks/:id
    @PutMapping("/tasks/{id}")
    public Task updateTask(

            @PathVariable Long id,

            @RequestBody
            UpdateTaskRequest request
    ) {

        return taskService.updateTask(id, request);
    }

    // PATCH /tasks/:id/status
    @PatchMapping("/tasks/{id}/status")
    public Task updateTaskStatus(

            @PathVariable Long id,

            @RequestBody
            UpdateTaskStatusRequest request
    ) {

        return taskService.updateTaskStatus(
                id,
                request.getStatus()
        );
    }

    // DELETE /tasks/:id
    @PreAuthorize("hasAuthority('TEACHER')")
        @DeleteMapping("/tasks/{id}")
        public String deleteTask(
                @PathVariable Long id,
                Authentication authentication
        ) {

        Long currentUserId = ((com.example.se330.security.CustomUserDetails)
                authentication.getPrincipal()
        ).getId();

        taskService.deleteTask(id, currentUserId);

        return "Task deleted successfully";
        }
}