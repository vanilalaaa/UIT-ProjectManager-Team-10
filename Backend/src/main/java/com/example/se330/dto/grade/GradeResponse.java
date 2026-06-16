package com.example.se330.dto.grade;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GradeResponse {

    private Long id;
    private Long submissionId;
    private Long projectId;
    private Long groupId;
    private Integer score;
    private Integer maxScore;
    private String feedback;
    private LocalDateTime gradedAt;
    private Long gradedById;
    private String gradedByName;
    private List<CriterionScoreResponse> criterionScores;
}
