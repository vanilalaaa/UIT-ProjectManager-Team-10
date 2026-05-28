package com.example.se330.dto.project;

import java.time.LocalDate;

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
public class CreateProjectRequest {
    private String title;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long categoryId;
}
