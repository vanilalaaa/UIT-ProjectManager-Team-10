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
            // "Chờ duyệt" của GV = đề xuất đồ án đang chờ duyệt (Registration PENDING) trong các
            // lớp do GV phụ trách. Mỗi đề xuất luôn gắn với một nhóm SV đã đăng ký — GV chỉ duyệt
            // đồ án có nhóm tham gia, không có đồ án trống. Khớp với getStatDetails("pendingRequests").
            long pendingRequests = courseRepository.findByLecturer_Id(user.getId()).stream()
                    .mapToLong(course -> registrationRepository
                            .findByProject_Course_IdAndStatus(course.getId(), RegistrationStatus.PENDING).size())
                    .sum();
            quickStats.put("pendingGrades", pendingSubmissions);
            quickStats.put("totalProjects", (long) projects.size());
            quickStats.put("pendingRequests", pendingRequests);
            quickStats.put("upcomingDeadlines", upcomingDeadlines);
        } else {
            // Đếm theo task của chính sinh viên để khớp với phần chi tiết (getStatDetails),
            // vốn lọc theo assignedTo/createdBy chứ không phải toàn bộ task của project.
            List<Task> assignedTasks = taskRepository.findByAssignedTo_Id(userId);
            long myCompleted = assignedTasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.DONE)
                    .count();
            long myUpdated = assignedTasks.stream()
                    .filter(t -> t.getUpdatedAt() != null && !t.getUpdatedAt().equals(t.getCreatedAt()))
                    .count();
            long myCreated = taskRepository.findByCreatedBy_Id(userId).size();
            long myDueSoon = assignedTasks.stream()
                    .filter(t -> t.getStatus() != TaskStatus.DONE)
                    .count();

            quickStats.put("completed", myCompleted);
            quickStats.put("updated", myUpdated);
            quickStats.put("created", myCreated);
            quickStats.put("dueSoon", myDueSoon);
            quickStats.put("total", (long) assignedTasks.size());
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

            case "pendingRequests": { // Chờ duyệt — đề xuất đồ án chờ GV duyệt (đã có nhóm đăng ký)
                List<Course> courses = (user.getRole() == Role.TEACHER)
                        ? courseRepository.findByLecturer_Id(user.getId())
                        : courseRepository.findAll();
                for (Course course : courses) {
                    for (Registration reg : registrationRepository
                            .findByProject_Course_IdAndStatus(course.getId(), RegistrationStatus.PENDING)) {
                        Project proposed = reg.getProject();
                        String groupName = reg.getGroup() != null ? reg.getGroup().getName() : "Nhóm";
                        result.add(StatDetailResponse.builder()
                                .id(reg.getRegistrationId())
                                .type("REGISTRATION")
                                .title(proposed != null ? proposed.getTitle() : "Đề xuất đồ án")
                                .subtitle("Nhóm " + groupName + " · " + course.getName())
                                .status(reg.getStatus() != null ? reg.getStatus().name() : null)
                                .timestamp(reg.getRegisteredAt())
                                .build());
                    }
                }
                break;
            }

            case "upcomingDeadlines": { // Sắp đến hạn
                LocalDate today = LocalDate.now();
                // Cùng cửa sổ 14 ngày với thẻ đếm trong getStats để số liệu khớp nhau.
                for (Project project : resolveProjects(user)) {
                    if (project.getEndDate() != null
                            && !project.getEndDate().isBefore(today)
                            && project.getEndDate().isBefore(today.plusDays(14))) {
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