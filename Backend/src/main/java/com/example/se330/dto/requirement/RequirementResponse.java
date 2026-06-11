package com.example.se330.dto.requirement;

import java.util.List;

import lombok.Builder;
import lombok.Data;

// DTO phẳng khớp type FE ProjectRequirement. deadline là chuỗi "YYYY-MM-DD"
// (hoặc "" khi chưa đặt) để dùng trực tiếp cho <input type="date">.
@Data
@Builder
public class RequirementResponse {
    private Long categoryId;
    private String categoryName;
    private String description;
    private String deadline;
    private List<RubricCriterionResponse> criteria;
}
