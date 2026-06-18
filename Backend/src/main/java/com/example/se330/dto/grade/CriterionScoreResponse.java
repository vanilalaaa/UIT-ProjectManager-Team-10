package com.example.se330.dto.grade;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CriterionScoreResponse {

    private Long criterionId;
    private String name;
    private BigDecimal maxScore;
    private BigDecimal score;
    private String note;
}
