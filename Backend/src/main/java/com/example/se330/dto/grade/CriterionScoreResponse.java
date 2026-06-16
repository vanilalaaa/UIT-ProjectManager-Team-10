package com.example.se330.dto.grade;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CriterionScoreResponse {

    private Long criterionId;
    private String name;
    private Integer maxScore;
    private Integer score;
    private String note;
}
