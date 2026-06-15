package com.example.se330.dto.task;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BoardGroupResponse {
    private Long groupId;
    private String name;
    private Long leaderId;
    private List<UserLiteResponse> members;
}
