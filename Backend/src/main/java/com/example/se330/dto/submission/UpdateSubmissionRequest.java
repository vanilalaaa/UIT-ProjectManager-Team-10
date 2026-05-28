package com.example.se330.dto.submission;

import lombok.Data;
import com.example.se330.enums.SubmissionStatus;

@Data
public class UpdateSubmissionRequest {

    private String filePath;
    private SubmissionStatus status;
}