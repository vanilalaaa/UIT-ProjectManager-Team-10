package com.example.se330.dto.admin.course;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class AdminCreateCourseRequest {
    @NotBlank(message = "Course name is required")
    private String name;

    @NotNull(message = "Lecturer id is required")
    private Long lecturerId;

    @NotNull(message = "Max students is required")
    private Integer maxStudents;

    private LocalDate startDate;
    private LocalDate endDate;
}