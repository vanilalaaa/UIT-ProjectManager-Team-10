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
import com.example.se330.entity.Course;
import com.example.se330.entity.Group;
import com.example.se330.entity.GroupMember;
import com.example.se330.entity.Notification;
import com.example.se330.entity.Project;
import com.example.se330.entity.Registration;
import com.example.se330.entity.Submission;
import com.example.se330.entity.Task;
import com.example.se330.entity.User;
import com.example.se330.enums.FeedType;
import com.example.se330.enums.GroupMemberStatus;
import com.example.se330.enums.ProjectStatus;
import com.example.se330.enums.RegistrationStatus;
import com.example.se330.enums.Role;
import com.example.se330.enums.SubmissionStatus;
import com.example.se330.enums.TaskStatus;
import com.example.se330.repository.CourseRepository;
import com.example.se330.repository.GroupMemberRepository;
import com.example.se330.repository.GroupRepository;
import com.example.se330.repository.NotificationRepository;
import com.example.se330.repository.ProjectRepository;
import com.example.se330.repository.RegistrationRepository;
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
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final RegistrationRepository registrationRepository;
    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<FeedItemResponse> getFeed(Long userId, int limit) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<Project> projects = resolveProjects(user);

        List<FeedItemResponse> items = new ArrayList<>();

        // Task là việc nội bộ nhóm → chỉ hiện cho SV. GV chỉ quan tâm bài nộp + đề xuất.
        final boolean isStudent = user.getRole() == Role.STUDENT;

        for (Project project : projects) {

            if (isStudent) for (Task task : taskRepository.findByProject_Id(project.getId())) {
                User assignee = task.getAssignedTo();
                items.add(FeedItemResponse.builder()
                        .type(FeedType.TASK)
                        .referenceId(task.getId())
                        .title(task.getTitle())
                        .description(task.getDescription())
                        .status(task.getStatus() != null ? task.getStatus().name() : null)
                        .projectId(project.getId())
                        .courseId(project.getCourse() != null ? project.getCourse().getId() : null)
                        .projectTitle(project.getTitle())
                        .actorName(assignee != null ? assignee.getName() : "Hệ thống")
                        .actorAvatar(assignee != null && assignee.getUserProfile() != null 
                            ? assignee.getUserProfile().getAvatarUrl() : null)
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
                        .courseId(project.getCourse() != null ? project.getCourse().getId() : null)
                        .projectTitle(project.getTitle())
                        .actorName("Nhóm nộp bài")
                        .timestamp(submission.getSubmittedAt())
                        .build());
            }
        }

        appendRequestNotifications(user, items);

        // Thông báo sự kiện đã lưu (vd GV duyệt/từ chối đề tài) gửi riêng cho user này.
        for (Notification n : notificationRepository.findTop30ByRecipient_IdOrderByCreatedAtDesc(userId)) {
            items.add(FeedItemResponse.builder()
                    .type(FeedType.PROJECT_RESULT)
                    .referenceId(n.getId())
                    .title(n.getTitle())
                    .description(n.getMessage())
                    .status(n.getType())
                    .courseId(n.getCourseId())
                    .projectId(n.getProjectId())
                    .actorName("Giảng viên")
                    .timestamp(n.getCreatedAt())
                    .build());
        }

        return items.stream()
                .filter(item -> item.getTimestamp() != null)
                .sorted(Comparator.comparing(FeedItemResponse::getTimestamp).reversed())
                .limit(limit > 0 ? limit : 20)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HomeStatsResponse getStats(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<Project> projects = resolveProjects(user);

        Map<String, Long> tasksByStatus = initCounts(TaskStatus.values());
        Map<String, Long> projectsByStatus = initCounts(ProjectStatus.values());
        Map<String, Long> submissionsByStatus = initCounts(SubmissionStatus.values());

        long totalTasks = 0;
        long completedTasks = 0;
        long updatedTasks = 0;
        long createdTasks = 0;
        long totalSubmissions = 0;
        long pendingSubmissions = 0;

        for (Project project : projects) {

            if (project.getStatus() != null) {
                projectsByStatus.merge(project.getStatus().name(), 1L, Long::sum);
            }

            for (Task task : taskRepository.findByProject_Id(project.getId())) {
                totalTasks++;
                if (task.getUpdatedAt() != null) {
                    updatedTasks++;
                }
                if (task.getCreatedBy() != null && task.getCreatedBy().getId().equals(userId)) {
                    createdTasks++;
                }
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

        Map<String, Long> quickStats = new LinkedHashMap<>();
        if (user.getRole() == Role.TEACHER) {
            long upcomingDeadlines = projects.stream()
                    .filter(p -> p.getEndDate() != null
                            && !p.getEndDate().isBefore(LocalDate.now())
                            && p.getEndDate().isBefore(LocalDate.now().plusDays(14)))
                    .count();
            quickStats.put("pendingGrades", pendingSubmissions);
            quickStats.put("totalProjects", (long) projects.size());
            quickStats.put("pendingRequests", 0L);
            quickStats.put("upcomingDeadlines", upcomingDeadlines);
        } else {
            quickStats.put("completed", completedTasks);
            quickStats.put("updated", updatedTasks);
            quickStats.put("created", createdTasks);
            quickStats.put("dueSoon", totalTasks - completedTasks);
            quickStats.put("total", totalTasks);
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
                .quickStats(quickStats)
                .build();
    }


    // Thông báo dạng "yêu cầu cần xử lý": SV trưởng nhóm thấy người xin vào nhóm;
    // GV thấy nhóm đề xuất đề tài chờ duyệt. (Task/Submission đã có ở feed theo project.)
    private void appendRequestNotifications(User user, List<FeedItemResponse> items) {
        if (user.getRole() == Role.STUDENT) {
            for (Group group : groupRepository.findByLeader_Id(user.getId())) {
                for (GroupMember pending : groupMemberRepository.findByGroupIdAndStatus(
                        group.getId(), GroupMemberStatus.PENDING)) {
                    User actor = pending.getUser();
                    items.add(FeedItemResponse.builder()
                            .type(FeedType.GROUP_REQUEST)
                            .referenceId(pending.getGroupMemberId())
                            .title("xin gia nhập nhóm " + group.getName())
                            .status("PENDING")
                            .courseId(group.getCourse() != null ? group.getCourse().getId() : null)
                            .projectTitle(group.getName())
                            .actorName(actor != null ? actor.getName() : "Sinh viên")
                            .actorAvatar(actor != null && actor.getUserProfile() != null
                                    ? actor.getUserProfile().getAvatarUrl()
                                    : null)
                            .timestamp(pending.getCreatedAt() != null
                                    ? pending.getCreatedAt()
                                    : (pending.getJoinedDate() != null
                                            ? pending.getJoinedDate().atStartOfDay()
                                            : null))
                            .build());
                }
            }
        }

        if (user.getRole() == Role.TEACHER) {
            for (Course course : courseRepository.findByLecturer_Id(user.getId())) {
                for (Registration reg : registrationRepository.findByProject_Course_IdAndStatus(
                        course.getId(), RegistrationStatus.PENDING)) {
                    Project proposed = reg.getProject();
                    items.add(FeedItemResponse.builder()
                            .type(FeedType.PROJECT_PROPOSAL)
                            .referenceId(reg.getRegistrationId())
                            .title("đề xuất đề tài: " + (proposed != null ? proposed.getTitle() : ""))
                            .status("PENDING")
                            .projectId(proposed != null ? proposed.getId() : null)
                            .courseId(course.getId())
                            .projectTitle(proposed != null ? proposed.getTitle() : null)
                            .actorName(reg.getGroup() != null ? reg.getGroup().getName() : "Nhóm")
                            .timestamp(reg.getRegisteredAt())
                            .build());
                }
            }
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