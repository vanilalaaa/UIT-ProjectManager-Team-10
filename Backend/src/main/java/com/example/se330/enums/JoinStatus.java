package com.example.se330.enums;

public enum JoinStatus {
    PENDING, // Chờ duyệt
    ACTIVE, // Đang học (Đã tham gia thành công)
    COMPLETED, // Đã hoàn thành khóa học
    REJECTED, // Bị từ chối tham gia (Do thanh toán lỗi hoặc Admin hủy)
    CANCELLED, // Người dùng chủ động hủy tham gia
    SUSPENDED, // Bị tạm dừng/Khóa quyền truy cập (Do vi phạm hoặc hết hạn)
    BLOCKED
}
