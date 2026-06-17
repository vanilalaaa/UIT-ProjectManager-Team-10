package com.example.se330.dto.requirement;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RequirementResponse {
    private Long categoryId;
    private String categoryName;
    private String description;
    private String deadline;
    private List<RubricCriterionResponse> criteria;
}
