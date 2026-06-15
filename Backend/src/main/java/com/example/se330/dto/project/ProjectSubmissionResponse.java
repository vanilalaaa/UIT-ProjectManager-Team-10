package com.example.se330.dto.project;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectSubmissionResponse {
    private Long submissionId;
    private String status;
    private String submittedAt;
    private String filePath;
}
