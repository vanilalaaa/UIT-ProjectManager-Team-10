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
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// Tổng hợp báo cáo công việc của các nhóm ĐÃ NỘP BÀI trong 1 đồ án, để giảng viên
// xem được mỗi thành viên nhận bao nhiêu task, hoàn thành tỷ lệ bao nhiêu, mất bao
// nhiêu ngày để hoàn thành.
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubmissionReportService {

    private final SubmissionRepository submissionRepository;
    private final TaskRepository taskRepository;

    public List<GroupTaskReport> getReport(Long projectId) {

        // Chỉ báo cáo những nhóm đã nộp bài (giữ thứ tự xuất hiện, loại trùng).
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

        long totalTasks = tasks.size();
        long groupCompleted = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE)
                .count();

        List<MemberTaskReport> memberReports = new ArrayList<>();
        for (GroupMember gm : group.getMembers()) {
            if (gm.getStatus() != GroupMemberStatus.ACTIVE || gm.getUser() == null) {
                continue;
            }
            memberReports.add(buildMemberReport(gm, tasks));
        }

        return GroupTaskReport.builder()
                .groupId(group.getId())
                .groupName(group.getName())
                .totalTasks(totalTasks)
                .completedTasks(groupCompleted)
                .completionRate(percentage(groupCompleted, totalTasks))
                .memberCount(memberReports.size())
                .members(memberReports)
                .build();
    }

    private MemberTaskReport buildMemberReport(GroupMember gm, List<Task> groupTasks) {

        User user = gm.getUser();

        List<Task> assigned = groupTasks.stream()
                .filter(t -> t.getAssignedTo() != null
                        && t.getAssignedTo().getId().equals(user.getId()))
                .toList();

        List<Task> completed = assigned.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE)
                .toList();

        long assignedCount = assigned.size();
        long completedCount = completed.size();

        // Số ngày hoàn thành ≈ khoảng cách từ lúc tạo task tới lần cập nhật cuối (khi
        // chuyển sang DONE). Chỉ tính các task DONE có đủ mốc thời gian hợp lệ.
        List<Long> minutesToComplete = completed.stream()
                .filter(t -> t.getCreatedAt() != null && t.getUpdatedAt() != null)
                .map(t -> Duration.between(t.getCreatedAt(), t.getUpdatedAt()).toMinutes())
                .filter(m -> m >= 0)
                .toList();

        Double avgDays = null;
        if (!minutesToComplete.isEmpty()) {
            double avgMinutes = minutesToComplete.stream()
                    .mapToLong(Long::longValue).average().orElse(0);
            avgDays = Math.round(avgMinutes / 1440.0 * 10.0) / 10.0;
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
                .completionRate(percentage(completedCount, assignedCount))
                .avgCompletionDays(avgDays)
                .build();
    }

    private double percentage(long part, long total) {
        if (total <= 0) {
            return 0.0;
        }
        return Math.round(part * 1000.0 / total) / 10.0;
    }
}
