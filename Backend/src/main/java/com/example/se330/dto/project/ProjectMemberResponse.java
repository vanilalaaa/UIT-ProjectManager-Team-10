package com.example.se330.dto.project;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectMemberResponse {
    private Long id;
    private String name;
    private String avatar;
}
