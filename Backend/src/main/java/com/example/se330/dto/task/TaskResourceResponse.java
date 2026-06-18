package com.example.se330.dto.task;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResourceResponse {
    private Long id;
    private String type;
    private String label;
    private String url;
    private String createdAt;
}
