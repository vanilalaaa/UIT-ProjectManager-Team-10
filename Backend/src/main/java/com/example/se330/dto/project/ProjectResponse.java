package com.example.se330.dto.project;

import java.time.LocalDate;

import com.example.se330.enums.ProjectStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectResponse {
    private Long projectId;
    private Long courseId;
    private Long categoryId;
    private String title;
    private String description;
    private ProjectStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
}
