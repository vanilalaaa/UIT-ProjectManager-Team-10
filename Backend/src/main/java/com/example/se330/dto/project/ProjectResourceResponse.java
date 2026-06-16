package com.example.se330.dto.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResourceResponse {
    private Long id;
    private String type;
    private String label;
    private String url;
}
