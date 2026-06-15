package com.example.se330.dto.home;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomeStatsResponse {

    private long totalProjects;
    private long totalTasks;
    private long completedTasks;
    private long totalSubmissions;
    private long pendingSubmissions; 

    private Map<String, Long> tasksByStatus;
    private Map<String, Long> projectsByStatus;
    private Map<String, Long> submissionsByStatus;

    // Quick stats theo role cho thẻ tổng quan ở Home (key khớp FE QuickStats).
    private Map<String, Long> quickStats;
}
