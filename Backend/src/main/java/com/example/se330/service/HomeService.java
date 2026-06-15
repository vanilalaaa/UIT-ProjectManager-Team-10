package com.example.se330.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.se330.dto.home.FeedItemResponse;
import com.example.se330.dto.home.HomeStatsResponse;
import com.example.se330.dto.home.StatDetailResponse;
import com.example.se330.entity.Course;
import com.example.se330.entity.CourseRequest;
import com.example.se330.entity.Project;
import com.example.se330.entity.Submission;
import com.example.se330.entity.Task;
import com.example.se330.entity.User;
import com.example.se330.enums.FeedType;
import com.example.se330.enums.JoinStatus;
import com.example.se330.enums.ProjectStatus;
import com.example.se330.enums.Role;
import com.example.se330.enums.SubmissionStatus;
import com.example.se330.enums.TaskStatus;
import com.example.se330.repository.CourseRepository;
import com.example.se330.repository.CourseRequestRepository;
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
    private final CourseRequestRepository courseRequestRepository;

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


    /**
     * Trả về danh sách chi tiết phía sau từng ô thống kê khi người dùng bấm vào ô đó.
     * type tương ứng với key của các ô ở QuickStats (frontend).
     */
    @Transactional(readOnly = true)
    public List<StatDetailResponse> getStatDetails(Long userId, String type) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (type == null || type.isBlank()) {
            throw new IllegalArgumentException("Thiếu tham số 'type'.");
        }

        List<StatDetailResponse> result = new ArrayList<>();

        switch (type) {

            // ----- GIẢNG VIÊN -----
            case "pendingGrades": // Bài chờ chấm
                for (Project project : resolveProjects(user)) {
                    for (Submission s : submissionRepository.findByProject_Id(project.getId())) {
                        if (s.getStatus() != SubmissionStatus.GRADED) {
                            result.add(StatDetailResponse.builder()
                                    .id(s.getId())
                                    .type("SUBMISSION")
                                    .title(s.getGroup() != null
                                            ? "Bài nộp của nhóm " + s.getGroup().getName()
                                            : "Bài nộp #" + s.getId())
                                    .subtitle(project.getTitle())
                                    .status(s.getStatus() != null ? s.getStatus().name() : null)
                                    .timestamp(s.getSubmittedAt())
                                    .build());
                        }
                    }
                }
                break;

            case "totalProjects": // Tổng đồ án
                for (Project project : resolveProjects(user)) {
                    result.add(projectDetail(project));
                }
                break;

            case "pendingRequests": { // Chờ duyệt
                List<Course> courses = (user.getRole() == Role.TEACHER)
                        ? courseRepository.findByLecturer_Id(user.getId())
                        : courseRepository.findAll();
                for (Course course : courses) {
                    for (CourseRequest req : courseRequestRepository
                            .findAllByCourseAndStatus(course, JoinStatus.PENDING)) {
                        result.add(StatDetailResponse.builder()
                                .id(req.getId())
                                .type("REQUEST")
                                .title(req.getStudent() != null ? req.getStudent().getName() : "Sinh viên")
                                .subtitle(course.getName())
                                .status(req.getStatus() != null ? req.getStatus().name() : null)
                                .timestamp(req.getRequestAt())
                                .build());
                    }
                }
                break;
            }

            case "upcomingDeadlines": { // Sắp đến hạn
                LocalDate today = LocalDate.now();
                for (Project project : resolveProjects(user)) {
                    if (project.getEndDate() != null && !project.getEndDate().isBefore(today)) {
                        result.add(projectDetail(project));
                    }
                }
                result.sort(Comparator.comparing(StatDetailResponse::getTimestamp,
                        Comparator.nullsLast(Comparator.naturalOrder())));
                break;
            }

            // ----- SINH VIÊN -----
            case "completed": // Completed
                addTaskDetails(result, taskRepository.findByAssignedTo_IdAndStatus(userId, TaskStatus.DONE));
                break;

            case "updated": // Updated
                addTaskDetails(result, taskRepository.findByAssignedTo_Id(userId).stream()
                        .filter(t -> t.getUpdatedAt() != null && !t.getUpdatedAt().equals(t.getCreatedAt()))
                        .collect(Collectors.toList()));
                break;

            case "created": // Created
                addTaskDetails(result, taskRepository.findByCreatedBy_Id(userId));
                break;

            case "dueSoon": // Due Soon
                addTaskDetails(result, taskRepository.findByAssignedTo_Id(userId).stream()
                        .filter(t -> t.getStatus() != TaskStatus.DONE)
                        .sorted(Comparator.comparing(Task::getDeadline,
                                Comparator.nullsLast(Comparator.naturalOrder())))
                        .collect(Collectors.toList()));
                break;

            default:
                throw new IllegalArgumentException("Loại thống kê không hợp lệ: " + type);
        }

        return result;
    }

    private StatDetailResponse projectDetail(Project project) {
        return StatDetailResponse.builder()
                .id(project.getId())
                .type("PROJECT")
                .title(project.getTitle())
                .subtitle(project.getCourse() != null ? project.getCourse().getName() : null)
                .status(project.getStatus() != null ? project.getStatus().name() : null)
                .timestamp(project.getEndDate() != null ? project.getEndDate().atStartOfDay() : null)
                .build();
    }

    private void addTaskDetails(List<StatDetailResponse> result, List<Task> tasks) {
        for (Task task : tasks) {
            result.add(StatDetailResponse.builder()
                    .id(task.getId())
                    .type("TASK")
                    .title(task.getTitle())
                    .subtitle(task.getProject() != null ? task.getProject().getTitle() : null)
                    .status(task.getStatus() != null ? task.getStatus().name() : null)
                    .timestamp(task.getDeadline() != null ? task.getDeadline() : task.getUpdatedAt())
                    .build());
        }
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
