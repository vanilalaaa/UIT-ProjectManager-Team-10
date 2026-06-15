package com.example.se330.dto.home;

import java.time.LocalDateTime;

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
public class StatDetailResponse {

    private Long id;

    private String type;

    private String title;

    private String subtitle;

    private String status;

    private LocalDateTime timestamp;
}
