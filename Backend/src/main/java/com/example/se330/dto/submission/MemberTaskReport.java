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
    private long completedTasks;    
    private double completionRate;  
    private Double avgCompletionDays; 
}
