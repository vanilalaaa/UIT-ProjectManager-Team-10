package com.example.se330.dto.join_course;

import java.time.LocalDateTime;

import com.example.se330.enums.JoinStatus;

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
public class JoinCourseResponse {
    private Long joinCourseId;
    private Long courseId;
    private String code;
    private Long studentId;
    private JoinStatus status;
    private LocalDateTime requestAt;
}
