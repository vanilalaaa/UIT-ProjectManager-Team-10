package com.example.se330.dto.grade;

import java.util.List;

import lombok.Data;

@Data
public class CreateGradeRequest {

    private Long submissionId;
    private Integer score;
    private Integer maxScore;
    private String feedback;
    private List<CriterionScoreRequest> criterionScores;
}
