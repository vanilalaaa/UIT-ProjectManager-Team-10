package com.example.se330.dto.grade;

import lombok.Data;

@Data
public class CriterionScoreRequest {

    private Long criterionId;
    private String name;
    private Integer maxScore;
    private Integer score;
    private String note;
}
