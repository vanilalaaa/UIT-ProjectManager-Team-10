package com.example.se330.dto.task;

import com.example.se330.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateTaskRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private Long assignedToId;

    private Long groupId;

    private TaskStatus status;

    private LocalDateTime deadline;
}