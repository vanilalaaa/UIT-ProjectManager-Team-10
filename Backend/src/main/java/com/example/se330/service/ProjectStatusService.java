package com.example.se330.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.se330.entity.Project;
import com.example.se330.enums.ProjectStatus;
import com.example.se330.enums.RegistrationStatus;
import com.example.se330.repository.GradeRepository;
import com.example.se330.repository.ProjectRepository;
import com.example.se330.repository.RegistrationRepository;
import com.example.se330.repository.SubmissionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectStatusService {

    private final ProjectRepository projectRepository;
    private final RegistrationRepository registrationRepository;
    private final SubmissionRepository submissionRepository;
    private final GradeRepository gradeRepository;

    @Transactional(readOnly = true)
    public ProjectStatus resolve(Project project) {
        if (project == null) {
            return null;
        }

        ProjectStatus current = project.getStatus();
        if (current == ProjectStatus.PENDING || current == ProjectStatus.CANCELLED) {
            return current;
        }

        Long projectId = project.getId();
        boolean hasApprovedGroup = projectId != null
                && registrationRepository.findFirstByProject_IdAndStatus(projectId, RegistrationStatus.APPROVED)
                        .isPresent();
        boolean hasSubmission = projectId != null && submissionRepository.existsByProject_Id(projectId);

        if (!hasApprovedGroup && !hasSubmission) {
            return current != null ? current : ProjectStatus.AVAILABLE;
        }

        if (!hasSubmission) {
            return ProjectStatus.IN_PROGRESS;
        }

        boolean hasGrade = projectId != null && gradeRepository.existsBySubmission_Project_Id(projectId);
        if (hasGrade && isDeadlinePassed(project.getEndDate())) {
            return ProjectStatus.GRADED;
        }

        return ProjectStatus.COMPLETED;
    }

    @Transactional
    public ProjectStatus refresh(Project project) {
        ProjectStatus resolved = resolve(project);
        if (project != null && resolved != null && project.getStatus() != resolved) {
            project.setStatus(resolved);
            projectRepository.save(project);
        }
        return resolved;
    }

    private boolean isDeadlinePassed(LocalDate endDate) {
        return endDate != null && LocalDate.now().isAfter(endDate);
    }
}
