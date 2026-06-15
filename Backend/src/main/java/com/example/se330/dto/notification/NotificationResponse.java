package com.example.se330.dto.notification;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Một thông báo gửi riêng cho người dùng (vd GV duyệt/từ chối đề tài) — hiển thị
// ở chuông Navbar. courseId/projectId để điều hướng tới trang liên quan (có thể null).
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;

    private String type;

    private String title;

    private String message;

    private Long courseId;

    private Long projectId;

    private Boolean isRead;

    private LocalDateTime createdAt;
}
