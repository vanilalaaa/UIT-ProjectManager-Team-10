package com.example.se330.dto.registration;

import lombok.Data;

// Nhận xét (tùy chọn) GV gửi kèm khi duyệt / từ chối đề xuất đề tài.
@Data
public class ReviewRegistrationRequest {
    private String note;
}
