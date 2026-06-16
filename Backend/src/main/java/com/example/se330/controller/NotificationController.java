package com.example.se330.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.notification.NotificationResponse;
import com.example.se330.security.CustomUserDetails;
import com.example.se330.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // GET /notifications - danh sách thông báo của user (mới → cũ)
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(
            Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<NotificationResponse> resp = notificationService.getMyNotifications(userDetails.getId());
        return ApiResponse.success(resp, "Lấy danh sách thông báo thành công.");
    }

    // GET /notifications/unread-count - số thông báo chưa đọc (badge chuông)
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        long count = notificationService.getUnreadCount(userDetails.getId());
        return ApiResponse.success(count, "Lấy số thông báo chưa đọc thành công.");
    }

    // PATCH /notifications/{id}/read - đánh dấu 1 thông báo đã đọc
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            Authentication authentication,
            @PathVariable Long id) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        notificationService.markAsRead(userDetails.getId(), id);
        return ApiResponse.success("Đã đánh dấu thông báo là đã đọc.");
    }

    // PATCH /notifications/read-all - đánh dấu tất cả đã đọc
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        notificationService.markAllAsRead(userDetails.getId());
        return ApiResponse.success("Đã đánh dấu tất cả thông báo là đã đọc.");
    }
}
