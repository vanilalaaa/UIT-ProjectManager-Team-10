package com.example.se330.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.se330.dto.home.FeedItemResponse;
import com.example.se330.dto.home.HomeStatsResponse;
import com.example.se330.entity.Project;
import com.example.se330.entity.Submission;
import com.example.se330.entity.Task;
import com.example.se330.entity.User;
import com.example.se330.enums.FeedType;
import com.example.se330.enums.ProjectStatus;
import com.example.se330.enums.Role;
import com.example.se330.enums.SubmissionStatus;
import com.example.se330.enums.TaskStatus;
import com.example.se330.repository.CourseRepository;
import com.example.se330.repository.ProjectRepository;
import com.example.se330.repository.SubmissionRepository;
import com.example.se330.repository.TaskRepository;
import com.example.se330.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final CourseRepository courseRepository;
    private final TaskRepository taskRepository;
    private final SubmissionRepository submissionRepository;

    public List<FeedItemResponse> getFeed(Long userId, int limit) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<Project> projects = resolveProjects(user);

        List<FeedItemResponse> items = new ArrayList<>();

        for (Project project : projects) {

            for (Task task : taskRepository.findByProject_Id(project.getId())) {
                items.add(FeedItemResponse.builder()
                        .type(FeedType.TASK)
                        .referenceId(task.getId())
                        .title(task.getTitle())
                        .description(task.getDescription())
                        .status(task.getStatus() != null ? task.getStatus().name() : null)
                        .projectId(project.getId())
                        .projectTitle(project.getTitle())
                        .timestamp(task.getUpdatedAt() != null
                                ? task.getUpdatedAt()
                                : task.getCreatedAt())
                        .build());
            }

            for (Submission submission : submissionRepository.findByProject_Id(project.getId())) {
                items.add(FeedItemResponse.builder()
                        .type(FeedType.SUBMISSION)
                        .referenceId(submission.getId())
                        .title("Nộp bài cho đồ án: " + project.getTitle())
                        .status(submission.getStatus() != null ? submission.getStatus().name() : null)
                        .projectId(project.getId())
                        .projectTitle(project.getTitle())
                        .timestamp(submission.getSubmittedAt())
                        .build());
            }
        }

        return items.stream()
                .filter(item -> item.getTimestamp() != null)
                .sorted(Comparator.comparing(FeedItemResponse::getTimestamp).reversed())
                .limit(limit > 0 ? limit : 20)
                .collect(Collectors.toList());
    }

    public HomeStatsResponse getStats(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<Project> projects = resolveProjects(user);

        Map<String, Long> tasksByStatus = initCounts(TaskStatus.values());
        Map<String, Long> projectsByStatus = initCounts(ProjectStatus.values());
        Map<String, Long> submissionsByStatus = initCounts(SubmissionStatus.values());

        long totalTasks = 0;
        long completedTasks = 0;
        long totalSubmissions = 0;
        long pendingSubmissions = 0;

        for (Project project : projects) {

            if (project.getStatus() != null) {
                projectsByStatus.merge(project.getStatus().name(), 1L, Long::sum);
            }

            for (Task task : taskRepository.findByProject_Id(project.getId())) {
                totalTasks++;
                if (task.getStatus() != null) {
                    tasksByStatus.merge(task.getStatus().name(), 1L, Long::sum);
                    if (task.getStatus() == TaskStatus.DONE) {
                        completedTasks++;
                    }
                }
            }

            for (Submission submission : submissionRepository.findByProject_Id(project.getId())) {
                totalSubmissions++;
                if (submission.getStatus() != null) {
                    submissionsByStatus.merge(submission.getStatus().name(), 1L, Long::sum);
                    if (submission.getStatus() != SubmissionStatus.GRADED) {
                        pendingSubmissions++;
                    }
                }
            }
        }

        return HomeStatsResponse.builder()
                .totalProjects(projects.size())
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .totalSubmissions(totalSubmissions)
                .pendingSubmissions(pendingSubmissions)
                .tasksByStatus(tasksByStatus)
                .projectsByStatus(projectsByStatus)
                .submissionsByStatus(submissionsByStatus)
                .build();
    }


    private List<Project> resolveProjects(User user) {

        if (user.getRole() == Role.STUDENT) {
            return userRepository.findProjectsByUser(user);
        }

        if (user.getRole() == Role.TEACHER) {
            return courseRepository.findByLecturer_Id(user.getId()).stream()
                    .flatMap(course -> projectRepository.findByCourse(course).stream())
                    .collect(Collectors.toList());
        }

        return projectRepository.findAll();
    }

    private <E extends Enum<E>> Map<String, Long> initCounts(E[] values) {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (E value : values) {
            counts.put(value.name(), 0L);
        }
        return counts;
    }
}
