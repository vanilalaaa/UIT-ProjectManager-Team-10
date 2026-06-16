package com.example.se330.controller;

import com.example.se330.dto.submission.UpdateSubmissionRequest;
import com.example.se330.entity.Submission;
import com.example.se330.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @GetMapping("/projects/{id}/submissions")
    public List<Submission> get(@PathVariable Long id) {
        return submissionService.getByProject(id);
    }

    @PostMapping(value = "/projects/{id}/submissions", consumes = {"multipart/form-data"})
    public Submission create(
            @PathVariable Long id,
            @RequestParam("groupId") Long groupId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) throws IOException {

        Long userId = ((com.example.se330.security.CustomUserDetails)
                authentication.getPrincipal()).getId();

        return submissionService.createSubmission(id, groupId, file, userId);
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