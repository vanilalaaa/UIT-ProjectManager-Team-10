package com.example.se330.dto.requirement;

import lombok.Data;

@Data
public class RubricCriterionRequest {
    // id của tiêu chí cũ (null nếu là tiêu chí mới). Có id -> BE cập nhật tại chỗ,
    // giữ nguyên criterion_id để điểm đã chấm (GradeCriterionScore) không bị mất.
    private Long id;
    private String name;
    private Integer maxScore;
}
