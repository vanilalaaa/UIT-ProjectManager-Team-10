package com.example.se330.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.se330.dto.project.CreateProjectRequest;
import com.example.se330.dto.project.ProjectResponse;
import com.example.se330.dto.project.UpdateProjectRequest;
import com.example.se330.entity.Course;
import com.example.se330.entity.Project;
import com.example.se330.enums.ProjectStatus;
import com.example.se330.repository.ProjectRepository;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final CourseService courseService;
    private final AdminCategoryService adminCategoryService;

    public ProjectService(
            ProjectRepository projectRepository,
            CourseService courseService,
            AdminCategoryService adminCategoryService) {
        this.projectRepository = projectRepository;
        this.courseService = courseService;
        this.adminCategoryService = adminCategoryService;
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

        return ProjectResponse.builder()
                .projectId(project.getId())
                .courseId(project.getCourse().getId())
                .categoryId(project.getCategory().getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .status(project.getStatus())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .build();
    }
}
