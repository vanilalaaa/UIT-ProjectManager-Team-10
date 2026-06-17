package com.example.se330.dto.project;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectSubmissionResponse {
    private Long submissionId;
    private String submittedAt;
    private String filePath;
    private Long groupId;
    private String groupName;
    private Long submittedById;
    private String submittedByName;
    private String submittedByUid;
    private String submittedByEmail;
}
