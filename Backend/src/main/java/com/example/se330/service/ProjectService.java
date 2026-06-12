package com.example.se330.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.se330.dto.project.CreateProjectRequest;
import com.example.se330.dto.project.ProjectMemberResponse;
import com.example.se330.dto.project.ProjectResponse;
import com.example.se330.dto.project.ProjectSubmissionResponse;
import com.example.se330.dto.project.UpdateProjectRequest;
import com.example.se330.entity.Category;
import com.example.se330.entity.Course;
import com.example.se330.entity.Group;
import com.example.se330.entity.Project;
import com.example.se330.entity.Registration;
import com.example.se330.entity.Submission;
import com.example.se330.entity.User;
import com.example.se330.enums.GroupMemberStatus;
import com.example.se330.enums.ProjectStatus;
import com.example.se330.enums.RegistrationStatus;
import com.example.se330.repository.ProjectRepository;
import com.example.se330.repository.RegistrationRepository;

@Service
@Transactional
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final CourseService courseService;
    private final AdminCategoryService adminCategoryService;
    private final RegistrationRepository registrationRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            CourseService courseService,
            AdminCategoryService adminCategoryService,
            RegistrationRepository registrationRepository) {
        this.projectRepository = projectRepository;
        this.courseService = courseService;
        this.adminCategoryService = adminCategoryService;
        this.registrationRepository = registrationRepository;
    }

    public ProjectResponse createProject(Long courseId, CreateProjectRequest req) {
        Project project = new Project();
        project.setCourse(this.courseService.getCourseById(courseId));
        project.setCategory(this.adminCategoryService.getCategoryById(req.getCategoryId()));
        project.setTitle(req.getTitle());
        project.setDescription(req.getDescription());
        project.setStartDate(req.getStartDate());
        project.setEndDate(req.getEndDate());
        project.setStatus(ProjectStatus.AVAILABLE);

        Project saved = this.projectRepository.save(project);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjectsByCourse(Long courseId) {
        Course course = this.courseService.getCourseById(courseId);
        List<Project> projects = this.projectRepository.findByCourse(course);

        return projects.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public Project getProjectById(Long projectId) {
        return this.projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectResponseById(Long projectId) {
        return toResponse(getProjectById(projectId));
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectDetail(Long courseId, Long projectId) {
        Project project = getProjectAndValidateCourse(courseId, projectId);
        return toResponse(project);
    }

    public ProjectResponse updateProject(Long courseId, Long projectId, UpdateProjectRequest req) {
        Project project = getProjectAndValidateCourse(courseId, projectId);
        project.setTitle(req.getTitle());
        project.setDescription(req.getDescription());
        project.setStartDate(req.getStartDate());
        project.setEndDate(req.getEndDate());

        if (req.getStatus() != null) {
            project.setStatus(req.getStatus());
        }

        if (req.getCategoryId() != null) {
            project.setCategory(this.adminCategoryService.getCategoryById(req.getCategoryId()));
        } else {
            project.setCategory(null);
        }

        Project updated = this.projectRepository.save(project);
        return toResponse(updated);
    }

    public void deleteProject(Long courseId, Long projectId) {
        Project project = getProjectAndValidateCourse(courseId, projectId);
        this.projectRepository.delete(project);
    }

    private Project getProjectAndValidateCourse(Long courseId, Long projectId) {
        Project project = this.projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        if (!project.getCourse().getId().equals(courseId)) {
            throw new RuntimeException("Project does not belong to this course");
        }

        return project;
    }

    public ProjectResponse toResponse(Project project) {
        if (project == null) {
            return null;
        }

        Course course = project.getCourse();
        Category category = project.getCategory();

        Group group = registrationRepository
                .findFirstByProject_IdAndStatus(project.getId(), RegistrationStatus.APPROVED)
                .map(Registration::getGroup)
                .orElse(null);

        List<ProjectMemberResponse> members = group == null ? List.of()
                : group.getMembers().stream()
                        .filter(m -> m.getStatus() == GroupMemberStatus.ACTIVE && m.getUser() != null)
                        .map(m -> toMember(m.getUser()))
                        .collect(Collectors.toList());

        List<ProjectSubmissionResponse> submissions = project.getSubmissions().stream()
                .map(ProjectService::toSubmission)
                .collect(Collectors.toList());

        return ProjectResponse.builder()
                .projectId(project.getId())
                .courseId(course != null ? course.getId() : null)
                .courseName(course != null ? course.getName() : null)
                .lecturerName(course != null && course.getLecturer() != null ? course.getLecturer().getName() : null)
                .categoryId(category != null ? category.getId() : null)
                .categoryName(category != null ? category.getName() : null)
                .title(project.getTitle())
                .description(project.getDescription())
                .status(project.getStatus())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .groupId(group != null ? group.getId() : null)
                .groupName(group != null ? group.getName() : null)
                .members(members)
                .submissions(submissions)
                .memberCount(members.size())
                .submissionCount(submissions.size())
                .build();
    }

    private ProjectMemberResponse toMember(User user) {
        String avatar = user.getUserProfile() != null ? user.getUserProfile().getAvatarUrl() : null;
        return ProjectMemberResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .avatar(avatar)
                .build();
    }

    private static ProjectSubmissionResponse toSubmission(Submission submission) {
        return ProjectSubmissionResponse.builder()
                .submissionId(submission.getId())
                .status(submission.getStatus() != null ? submission.getStatus().name() : null)
                .submittedAt(submission.getSubmittedAt() != null ? submission.getSubmittedAt().toString() : null)
                .filePath(submission.getFilePath())
                .build();
    }
}
