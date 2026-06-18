package com.example.se330.controller;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.submission.GroupTaskReport;
import com.example.se330.dto.submission.UpdateSubmissionRequest;
import com.example.se330.entity.Submission;
import com.example.se330.service.SubmissionReportService;
import com.example.se330.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;
    private final SubmissionReportService submissionReportService;

    @GetMapping("/projects/{id}/submissions")
    public List<Submission> get(@PathVariable Long id) {
        return submissionService.getByProject(id);
    }

    // Báo cáo công việc theo nhóm/thành viên cho giảng viên, hiển thị dưới danh sách bài nộp.
    @GetMapping("/projects/{id}/submissions/report")
    public ResponseEntity<ApiResponse<List<GroupTaskReport>>> getReport(@PathVariable Long id) {
        return ApiResponse.success(submissionReportService.getReport(id), "Lấy báo cáo công việc thành công.");
    }

    @PostMapping(value = "/projects/{id}/submissions", consumes = {"multipart/form-data"})
    public List<Submission> create(
            @PathVariable Long id,
            @RequestParam("groupId") Long groupId,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "file", required = false) MultipartFile file,
            Authentication authentication
    ) throws IOException {

        Long userId = ((com.example.se330.security.CustomUserDetails)
                authentication.getPrincipal()).getId();

        if ((files == null || files.isEmpty()) && file != null) {
            files = List.of(file);
        }

        return submissionService.createSubmission(id, groupId, files, userId);
    }

    @PutMapping("/submissions/{id}")
    public Submission update(
            @PathVariable Long id,
            @RequestBody UpdateSubmissionRequest request
    ) {
        return submissionService.updateSubmission(id, request);
    }

    @DeleteMapping("/submissions/{id}")
    public String delete(@PathVariable Long id) {
        submissionService.deleteSubmission(id);
        return "Xóa thành công";
    }
}
