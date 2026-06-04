package com.example.se330.dto.course;

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
public class CourseResponse {
    private Long courseId;
    private String code;
    private String name;
    private Long lecturer;
    private Integer maxStudents;
    private LocalDate startDate;
    private LocalDate endDate;
}
