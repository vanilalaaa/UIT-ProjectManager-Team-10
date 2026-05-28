package com.example.se330.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.se330.dto.project.ProjectResponse;
import com.example.se330.entity.Project;
import com.example.se330.entity.User;
import com.example.se330.repository.UserRepository;

@Service
public class StudentService {
    private final UserRepository userRepository;

    public StudentService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<ProjectResponse> getStudentProjects(Long id) {
        User student = this.userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên."));

        List<Project> projects = this.userRepository.findProjectsByUser(student);

        return projects.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public User getStudentById(Long id) {
        return this.userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên."));
    }

    public ProjectResponse mapToResponse(Project project) {
        if (project == null) {
            return null;
        }

        return ProjectResponse.builder()
                .projectId(project.getId())
                .courseId(project.getCourse() != null ? project.getCourse().getId() : null)
                .categoryId(project.getCategory() != null ? project.getCategory().getId() : null)
                .title(project.getTitle())
                .description(project.getDescription())
                .status(project.getStatus())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .build();
    }

}
