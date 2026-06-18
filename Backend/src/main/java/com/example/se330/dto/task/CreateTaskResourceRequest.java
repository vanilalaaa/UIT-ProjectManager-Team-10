package com.example.se330.dto.task;

import lombok.Data;

@Data
public class CreateTaskResourceRequest {

    // FILE | DRIVE | GITHUB | LINK
    // Nếu null thì mặc định "LINK" (khi gửi url) hoặc "FILE" (khi gửi file)
    private String type;

    private String label;

    // Dùng cho LINK/DRIVE/GITHUB; bỏ trống nếu type = FILE (gửi file thay)
    private String url;
}
