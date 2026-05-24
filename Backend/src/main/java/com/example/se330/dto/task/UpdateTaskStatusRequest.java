package com.example.se330.dto.task;

import com.example.se330.enums.TaskStatus;
import lombok.Data;

@Data
public class UpdateTaskStatusRequest {

    private TaskStatus status;
}