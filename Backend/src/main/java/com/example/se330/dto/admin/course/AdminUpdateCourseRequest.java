package com.example.se330.dto.admin.course;

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
public class AdminUpdateCourseRequest {
    private String name;
    private Long lecturerId;
    private Integer maxStudents;
    private LocalDate startDate;
    private LocalDate endDate;
}