package com.example.se330.dto.group;

import java.util.List;

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
public class GroupResponse {
    private Long groupId;
    private String name;
    private String description;
    private Long courseId;
    private Long leaderId;
    private String leaderName;
    private List<GroupMemberResponse> members;
    private Integer memberCount;
}
