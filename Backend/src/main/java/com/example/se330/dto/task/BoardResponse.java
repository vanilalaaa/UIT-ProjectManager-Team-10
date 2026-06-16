package com.example.se330.dto.task;

import java.util.List;

import lombok.Builder;
import lombok.Data;

// Dữ liệu 1 lần load bảng Kanban: task của nhóm + nhóm hiện tại + user đang đăng
// nhập (FE tự suy isLeader = group.leaderId === currentUser.id). group null khi
// user chưa có nhóm trong lớp của đồ án.
@Data
@Builder
public class BoardResponse {
    private List<TaskResponse> tasks;
    private UserLiteResponse currentUser;
    private BoardGroupResponse group;
}
