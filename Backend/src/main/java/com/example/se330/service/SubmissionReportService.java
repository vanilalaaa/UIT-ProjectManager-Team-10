package com.example.se330.service;

import com.example.se330.dto.submission.GroupTaskReport;
import com.example.se330.dto.submission.MemberTaskReport;
import com.example.se330.entity.Group;
import com.example.se330.entity.GroupMember;
import com.example.se330.entity.Submission;
import com.example.se330.entity.Task;
import com.example.se330.entity.User;
import com.example.se330.enums.GroupMemberStatus;
import com.example.se330.enums.TaskStatus;
import com.example.se330.repository.SubmissionRepository;
import com.example.se330.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubmissionReportService {

    private final SubmissionRepository submissionRepository;
    private final TaskRepository taskRepository;

    private static final double LATE_PENALTY_RATE = 0.30;

    public List<GroupTaskReport> getReport(Long projectId) {

        Map<Long, Group> submittedGroups = new LinkedHashMap<>();
        for (Submission submission : submissionRepository.findByProject_Id(projectId)) {
            Group group = submission.getGroup();
            if (group != null) {
                submittedGroups.putIfAbsent(group.getId(), group);
            }
        }

        List<GroupTaskReport> reports = new ArrayList<>();
        for (Group group : submittedGroups.values()) {
            reports.add(buildGroupReport(projectId, group));
        }
        return reports;
    }

    private GroupTaskReport buildGroupReport(Long projectId, Group group) {

        List<Task> tasks = taskRepository.findByProject_IdAndGroup_Id(projectId, group.getId());
        LocalDateTime now = LocalDateTime.now();

        long totalTasks = tasks.size();
        // Task trễ deadline VẪN được tính là hoàn thành (chỉ bị trừ % đóng góp).
        long groupCompleted = tasks.stream().filter(this::isCompleted).count();
        long groupLate = tasks.stream().filter(t -> isLate(t, now)).count();

        List<MemberTaskReport> memberReports = new ArrayList<>();
        for (GroupMember gm : group.getMembers()) {
            if (gm.getStatus() != GroupMemberStatus.ACTIVE || gm.getUser() == null) {
                continue;
            }
            memberReports.add(buildMemberReport(gm, tasks, now));
        }

        return GroupTaskReport.builder()
                .groupId(group.getId())
                .groupName(group.getName())
                .totalTasks(totalTasks)
                .completedTasks(groupCompleted)
                .lateTasks(groupLate)
                .completionRate(percentage(groupCompleted, totalTasks))
                .avgCompletionDays(avgCompletionDays(tasks))
                .memberCount(memberReports.size())
                .members(memberReports)
                .build();
    }

    private MemberTaskReport buildMemberReport(GroupMember gm, List<Task> groupTasks, LocalDateTime now) {

        User user = gm.getUser();

        List<Task> assigned = groupTasks.stream()
                .filter(t -> t.getAssignedTo() != null
                        && t.getAssignedTo().getId().equals(user.getId()))
                .toList();

        // Mọi task đã DONE đều được tính là hoàn thành (kể cả nộp trễ).
        long assignedCount = assigned.size();
        long completedCount = assigned.stream().filter(this::isCompleted).count();
        long lateCount = assigned.stream().filter(t -> isLate(t, now)).count();

        // Phần trăm đóng góp của thành viên; nếu có bất kỳ task trễ deadline thì trừ 30%.
        double completionRate = percentage(completedCount, assignedCount);
        if (lateCount > 0) {
            completionRate = Math.round(completionRate * (1 - LATE_PENALTY_RATE) * 10.0) / 10.0;
        }

        String avatar = user.getUserProfile() != null
                ? user.getUserProfile().getAvatarUrl() : null;

        return MemberTaskReport.builder()
                .userId(user.getId())
                .name(user.getName())
                .avatar(avatar)
                .uid(user.getUid())
                .email(user.getEmail())
                .leader(Boolean.TRUE.equals(gm.getIsLeader()))
                .assignedTasks(assignedCount)
                .completedTasks(completedCount)
                .lateTasks(lateCount)
                .completionRate(completionRate)
                .avgCompletionDays(avgCompletionDays(assigned))
                .build();
    }

    // Hoàn thành: task đã DONE (dù đúng hạn hay trễ deadline).
    private boolean isCompleted(Task t) {
        return t.getStatus() == TaskStatus.DONE;
    }

    // Trễ deadline: task DONE nhưng hoàn thành sau deadline, hoặc chưa xong mà đã quá deadline.
    private boolean isLate(Task t, LocalDateTime now) {
        if (t.getDeadline() == null) {
            return false;
        }
        if (t.getStatus() == TaskStatus.DONE) {
            LocalDateTime finishedAt = t.getUpdatedAt();
            return finishedAt != null && finishedAt.isAfter(t.getDeadline());
        }
        return now.isAfter(t.getDeadline());
    }

    private Double avgCompletionDays(List<Task> tasks) {
        List<Long> minutesToComplete = tasks.stream()
                .filter(this::isCompleted)
                .filter(t -> t.getCreatedAt() != null && t.getUpdatedAt() != null)
                .map(t -> Duration.between(t.getCreatedAt(), t.getUpdatedAt()).toMinutes())
                .filter(m -> m >= 0)
                .toList();
        if (minutesToComplete.isEmpty()) {
            return null;
        }
        double avgMinutes = minutesToComplete.stream()
                .mapToLong(Long::longValue).average().orElse(0);
        return Math.round(avgMinutes / 1440.0 * 10.0) / 10.0;
    }

    private double percentage(long part, long total) {
        if (total <= 0) {
            return 0.0;
        }
        return Math.round(part * 1000.0 / total) / 10.0;
    }
}
