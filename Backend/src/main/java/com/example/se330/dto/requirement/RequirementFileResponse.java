package com.example.se330.dto.requirement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequirementFileResponse {
    private Long id;
    private Long criterionId;
    private Long submissionRequirementId;
    private String label;
    private String url;
}
