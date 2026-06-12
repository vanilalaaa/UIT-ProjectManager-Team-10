package com.example.se330.dto.registration;

import java.util.List;

import com.example.se330.dto.project.ProjectMemberResponse;

import lombok.Builder;
import lombok.Data;

// 1 yêu cầu đăng ký đề tài (nhóm ↔ project) cho màn duyệt của giảng viên.
@Data
@Builder
public class RegistrationResponse {
    private Long registrationId;
    private Long projectId;
    private String projectTitle;
    private String projectDescription;
    private Long groupId;
    private String groupName;
    private String leaderName;
    private String leaderAvatar;
    private List<ProjectMemberResponse> members;
    private String status;
    private String registeredAt;
}
