package com.example.se330.dto.project;

import java.time.LocalDate;
import java.util.List;

import com.example.se330.enums.ProjectStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO phẳng khớp type FE Project: course/category/lecturer làm phẳng thành tên,
// nhóm nhận đề tài (qua registration APPROVED) thành groupId/groupName + members,
// kèm submissions và số đếm cho card.
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectResponse {
    private Long projectId;
    private Long courseId;
    private String courseName;
    private String lecturerName;
    private Long categoryId;
    private String categoryName;
    private String title;
    private String description;
    private ProjectStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long groupId;
    private String groupName;
    private List<ProjectMemberResponse> members;
    private List<ProjectSubmissionResponse> submissions;
    private Integer memberCount;
    private Integer submissionCount;
}
