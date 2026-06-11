package com.example.se330.dto.requirement;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RubricCriterionResponse {
    private Long id;
    private String name;
    private Integer maxScore;
}
