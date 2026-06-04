package com.example.se330.controller;

import com.example.se330.dto.submission.CreateSubmissionRequest;
import com.example.se330.dto.submission.UpdateSubmissionRequest;
import com.example.se330.entity.Submission;
import com.example.se330.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class SubmissionController {

    private final SubmissionService submissionService;

    // GET
    @GetMapping("/projects/{id}/submissions")
    public List<Submission> get(@PathVariable Long id) {
        return submissionService.getByProject(id);
    }

    // CREATE
    @PostMapping("/projects/{id}/submissions")
    public Submission create(
            @PathVariable Long id,
            @RequestBody CreateSubmissionRequest request,
            Authentication authentication
    ) {

        Long userId = ((com.example.se330.security.CustomUserDetails)
                authentication.getPrincipal()).getId();

        return submissionService.createSubmission(id, request, userId);
    }

    // UPDATE
    @PutMapping("/submissions/{id}")
    public Submission update(
            @PathVariable Long id,
            @RequestBody UpdateSubmissionRequest request
    ) {
        return submissionService.updateSubmission(id, request);
    }

    // DELETE
    @DeleteMapping("/submissions/{id}")
    public String delete(@PathVariable Long id) {
        submissionService.deleteSubmission(id);
        return "Deleted successfully";
    }
}