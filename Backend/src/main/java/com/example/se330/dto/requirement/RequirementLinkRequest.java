package com.example.se330.dto.requirement;

import lombok.Data;

@Data
public class RequirementLinkRequest {
    private Long criterionId;
    private Long submissionRequirementId;
    private String label;
    private String url;
}
