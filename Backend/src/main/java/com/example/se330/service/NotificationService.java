package com.example.se330.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.se330.dto.notification.NotificationResponse;
import com.example.se330.entity.Notification;
import com.example.se330.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // 30 thông báo mới nhất của user (mới → cũ) cho chuông Navbar.
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(Long userId) {
        return notificationRepository
                .findTop30ByRecipient_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Số chưa đọc → badge đỏ trên chuông.
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipient_IdAndIsReadFalse(userId);
    }

    // Đánh dấu 1 thông báo đã đọc (chỉ khi đúng chủ nhân).
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));

        if (notification.getRecipient() == null
                || !notification.getRecipient().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền với thông báo này");
        }

        if (!Boolean.TRUE.equals(notification.getIsRead())) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    // Đánh dấu tất cả thông báo chưa đọc của user là đã đọc.
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByRecipient_IdAndIsReadFalse(userId);
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .courseId(n.getCourseId())
                .projectId(n.getProjectId())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
