package com.example.se330.dto.grade;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class CriterionScoreRequest {

    private Long criterionId;
    private String name;
    private BigDecimal maxScore;
    private BigDecimal score;
    private String note;
}
