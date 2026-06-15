package com.example.se330.dto.task;

import lombok.Builder;
import lombok.Data;

// DTO phẳng khớp type FE Task: assignee/createdBy là {id,name,avatar}, group chỉ
// còn groupId, ngày là chuỗi ISO (FE tự new Date()).
@Data
@Builder
public class TaskResponse {
    private Long taskId;
    private String title;
    private String description;
    private String status;
    private UserLiteResponse assignee;
    private UserLiteResponse createdBy;
    private Long groupId;
    private String deadline;
    private String createdAt;
    private String updatedAt;
}
