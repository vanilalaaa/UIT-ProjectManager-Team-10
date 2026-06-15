package com.example.se330.dto.registration;

import lombok.Data;

// Nhóm đề xuất đề tài (tên + mô tả) gửi giảng viên duyệt.
@Data
public class ProposeProjectRequest {
    private String title;
    private String description;
}
