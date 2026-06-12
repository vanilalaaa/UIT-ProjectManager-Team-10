package com.example.se330.dto.group;

import lombok.Data;

// Trưởng nhóm mời 1 sinh viên (theo userId) vào nhóm.
@Data
public class InviteRequest {
    private Long userId;
}
