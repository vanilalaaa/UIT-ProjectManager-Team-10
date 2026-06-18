package com.example.se330.dto.requirement;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubmissionRequirementResponse {
    private Long id;
    private String content;
    private List<RequirementFileResponse> files;
}
