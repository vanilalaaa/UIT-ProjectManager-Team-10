package com.example.se330.dto.submission;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MemberTaskReport {
    private Long userId;
    private String name;
    private String avatar;
    private String uid;
    private String email;
    private boolean leader;

    private long assignedTasks;
    private long completedTasks;     // tổng task đã hoàn thành (DONE), kể cả nộp trễ
    private long lateTasks;          // số lần trễ deadline
    private double completionRate;   // phần trăm đóng góp; nếu có task trễ deadline thì đã trừ 30%
    private Double avgCompletionDays;
}
