package com.example.se330.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.requirement.RequirementFileResponse;
import com.example.se330.dto.requirement.RequirementLinkRequest;
import com.example.se330.dto.requirement.RequirementResponse;
import com.example.se330.dto.requirement.SaveRequirementRequest;
import com.example.se330.security.CustomUserDetails;
import com.example.se330.service.RequirementFileService;
import com.example.se330.service.RequirementService;

@RestController
@RequestMapping("/courses/{courseId}/requirement")
public class RequirementController {

    private final RequirementService requirementService;
    private final RequirementFileService requirementFileService;

    public RequirementController(RequirementService requirementService,
            RequirementFileService requirementFileService) {
        this.requirementService = requirementService;
        this.requirementFileService = requirementFileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<RequirementResponse>> getRequirement(@PathVariable Long courseId) {
        RequirementResponse resp = this.requirementService.getRequirement(courseId);
        return ApiResponse.success(resp, "Lấy yêu cầu đồ án thành công.");
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PutMapping
    public ResponseEntity<ApiResponse<RequirementResponse>> saveRequirement(
            @PathVariable Long courseId,
            @RequestBody SaveRequirementRequest req,
            Authentication authentication) {
        RequirementResponse resp = this.requirementService.saveRequirement(courseId, req, currentUserId(authentication));
        return ApiResponse.success(resp, "Lưu yêu cầu đồ án thành công.");
    }

    @GetMapping("/files")
    public ResponseEntity<ApiResponse<List<RequirementFileResponse>>> listFiles(
            @PathVariable Long courseId,
            @RequestParam(required = false) Long criterionId,
            @RequestParam(required = false) Long submissionRequirementId) {
        List<RequirementFileResponse> files = submissionRequirementId != null
                ? requirementFileService.listBySubmissionRequirement(courseId, submissionRequirementId)
                : criterionId != null
                        ? requirementFileService.listByCriterion(courseId, criterionId)
                        : requirementFileService.list(courseId);
        return ApiResponse.success(files, "Lấy tài liệu yêu cầu thành công.");
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PostMapping(value = "/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<RequirementFileResponse>> addFile(
            @PathVariable Long courseId,
            @RequestParam(required = false) Long criterionId,
            @RequestParam(required = false) Long submissionRequirementId,
            @RequestParam(required = false) String label,
            @RequestParam MultipartFile file,
            Authentication authentication) throws IOException {
        return ApiResponse.success(
                requirementFileService.add(
                        courseId,
                        criterionId,
                        submissionRequirementId,
                        label,
                        file,
                        currentUserId(authentication)),
                "Đã tải lên tài liệu.");
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @PostMapping("/links")
    public ResponseEntity<ApiResponse<RequirementFileResponse>> addLink(
            @PathVariable Long courseId,
            @RequestBody RequirementLinkRequest req,
            Authentication authentication) {
        return ApiResponse.success(
                requirementFileService.addLink(
                        courseId,
                        req.getCriterionId(),
                        req.getSubmissionRequirementId(),
                        req.getLabel(),
                        req.getUrl(),
                        currentUserId(authentication)),
                "Đã thêm liên kết.");
    }

    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    @DeleteMapping("/files/{fileId}")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @PathVariable Long courseId,
            @PathVariable Long fileId,
            Authentication authentication) {
        requirementFileService.delete(courseId, fileId, currentUserId(authentication));
        return ApiResponse.success("Đã xóa tài liệu.");
    }

    private Long currentUserId(Authentication authentication) {
        return ((CustomUserDetails) authentication.getPrincipal()).getId();
    }
}
