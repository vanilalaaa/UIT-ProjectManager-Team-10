package com.example.se330.dto.task;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserLiteResponse {
    private Long id;
    private String name;
    private String avatar;
}
