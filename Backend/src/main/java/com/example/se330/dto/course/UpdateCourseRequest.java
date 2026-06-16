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
public class UpdateCourseRequest {
    private String name;
    private Long lecturerId;
    private int maxStudents;
    private LocalDate startDate;
    private LocalDate endDate;
}
