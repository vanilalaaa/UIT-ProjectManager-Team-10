package com.example.se330.dto.requirement;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RubricCriterionResponse {
    private Long id;
    private String name;
    private BigDecimal maxScore;
    private List<RequirementFileResponse> files;
}
