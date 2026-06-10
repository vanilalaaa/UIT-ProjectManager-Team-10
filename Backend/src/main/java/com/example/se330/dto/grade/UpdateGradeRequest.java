package com.example.se330.dto.grade;

import lombok.Data;

@Data
public class UpdateGradeRequest {

    private Integer score;
    private Integer maxScore;
    private String feedback;
}
