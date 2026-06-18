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
    private long completedTasks;
    private double completionRate;   
    private int memberCount;

    private List<MemberTaskReport> members;
}
