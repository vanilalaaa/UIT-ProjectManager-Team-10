package com.example.se330.dto.home;

import java.time.LocalDateTime;

import com.example.se330.enums.FeedType;

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
public class FeedItemResponse {

    private FeedType type;

    private Long referenceId;

    private String title;

    private String description;

    private String status;

    private Long projectId;

    private Long courseId;

    private String projectTitle;

    private String actorName;

    private String actorAvatar;

    private LocalDateTime timestamp;

}
