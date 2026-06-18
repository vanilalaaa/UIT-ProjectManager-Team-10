package com.example.se330.dto.task;

import com.example.se330.enums.TaskStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateTaskRequest {

    private String title;

    private String description;

    private Long assignedToId;

    private Long validatorId;

    private String source;

    private TaskStatus status;

    private LocalDateTime deadline;

    private String comment;
}