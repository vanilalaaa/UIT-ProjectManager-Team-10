package com.example.se330.dto.group;

import lombok.Builder;
import lombok.Data;

// 1 lời mời nhóm gửi đến sinh viên (để SV chấp nhận/từ chối).
@Data
@Builder
public class InvitationResponse {
    private Long groupMemberId;
    private Long groupId;
    private String groupName;
    private Long courseId;
    private String courseName;
    private String leaderName;
    private Integer memberCount;
}
