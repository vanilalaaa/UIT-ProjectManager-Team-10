package com.example.se330.dto.group;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Thành viên nhóm dạng phẳng cho FE (member + profile + vai trò + trạng thái).
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMemberResponse {
    private Long groupMemberId;
    private Long userId;
    private String name;
    private String avatar;
    private String summary;
    private String uid;
    private String email;
    private Boolean isLeader;
    private String status;
}
