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
public class CreateCourseRequest {
    private String name;
    private Integer maxStudents;
    private LocalDate startDate;
    private LocalDate endDate;
    private String code;
}
