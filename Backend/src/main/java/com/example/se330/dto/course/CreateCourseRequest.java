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
    // Mã lớp bắt buộc do người tạo nhập (kiểm tra trùng, không tự sinh).
    private String code;
    private Long lecturerId;
    private Integer maxStudents;
    private LocalDate startDate;
    private LocalDate endDate;
}
