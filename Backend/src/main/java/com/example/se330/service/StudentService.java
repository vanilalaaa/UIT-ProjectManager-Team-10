package com.example.se330.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.se330.dto.project.ProjectResponse;
import com.example.se330.entity.Project;
import com.example.se330.entity.User;
import com.example.se330.repository.UserRepository;

@Service
public class StudentService {
    private final UserRepository userRepository;
    private final ProjectService projectService;

    public StudentService(UserRepository userRepository, ProjectService projectService) {
        this.userRepository = userRepository;
        this.projectService = projectService;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getStudentProjects(Long id) {
        User student = this.userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên."));

        List<Project> projects = this.userRepository.findProjectsByUser(student);

        return projects.stream()
                .map(this.projectService::toResponse)
                .collect(Collectors.toList());
    }

    public User getStudentById(Long id) {
        return this.userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên."));
    }
}
