package com.example.se330.dto.submission;

import lombok.Data;

@Data
public class CreateSubmissionRequest {

    private String filePath;
    private Long groupId;
}