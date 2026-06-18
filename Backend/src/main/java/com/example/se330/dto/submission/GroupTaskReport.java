package com.example.se330.dto.submission;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GroupTaskReport {
    private Long groupId;
    private String groupName;

    private long totalTasks;
    private long completedTasks;     // tổng task đã hoàn thành (DONE), kể cả nộp trễ
    private long lateTasks;          // tổng số lần trễ deadline
    private double completionRate;
    private Double avgCompletionDays; // thời gian hoàn thành trung bình của nhóm (ngày)
    private int memberCount;

    private List<MemberTaskReport> members;
}
