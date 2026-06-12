package com.example.se330.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Thông báo sự kiện gửi tới 1 người nhận (vd: GV duyệt/từ chối đề tài kèm nhận xét).
// Dùng cho các sự kiện mà dữ liệu nguồn có thể bị xoá (vd từ chối xoá project nháp).
@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id")
    private User recipient;

    private String type;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
