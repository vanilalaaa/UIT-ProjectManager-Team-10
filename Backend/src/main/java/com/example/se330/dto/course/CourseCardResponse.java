package com.example.se330.dto.course;

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
public class CourseCardResponse {
    private Long courseId;
    private String code;
    private String name;
    private String lecturerName;
    private Integer membersCount;
    private Integer projectsCount;
    private Integer maxStudents;
    private java.time.LocalDate startDate;
    private java.time.LocalDate endDate;
}
