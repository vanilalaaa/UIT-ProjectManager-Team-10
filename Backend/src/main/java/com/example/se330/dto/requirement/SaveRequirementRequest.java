package com.example.se330.dto.requirement;

import java.util.List;

import lombok.Data;

// Payload upsert yêu cầu đồ án. categoryId/deadline có thể null/"" (chưa đặt);
// criteria là toàn bộ barem mới (BE thay thế barem cũ).
@Data
public class SaveRequirementRequest {
    private Long categoryId;
    private String description;
    private String deadline;
    private List<RubricCriterionRequest> criteria;
}
