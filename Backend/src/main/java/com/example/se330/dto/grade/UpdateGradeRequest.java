package com.example.se330.dto.grade;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class UpdateGradeRequest {

    private BigDecimal score;
    private BigDecimal maxScore;
    private String feedback;

    private List<CriterionScoreRequest> criterionScores;
}
