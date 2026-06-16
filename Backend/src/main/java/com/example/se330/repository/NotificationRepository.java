package com.example.se330.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.se330.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findTop30ByRecipient_IdOrderByCreatedAtDesc(Long recipientId);

    // Số thông báo chưa đọc → hiển thị badge đỏ trên chuông.
    long countByRecipient_IdAndIsReadFalse(Long recipientId);

    // Các thông báo chưa đọc → dùng khi "đánh dấu tất cả đã đọc".
    List<Notification> findByRecipient_IdAndIsReadFalse(Long recipientId);
}
