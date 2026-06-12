package com.example.se330.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.se330.dto.project.ProjectMemberResponse;
import com.example.se330.dto.registration.RegistrationResponse;
import com.example.se330.entity.Group;
import com.example.se330.entity.GroupMember;
import com.example.se330.entity.Project;
import com.example.se330.entity.Registration;
import com.example.se330.entity.User;
import com.example.se330.enums.GroupMemberStatus;
import com.example.se330.enums.ProjectStatus;
import com.example.se330.enums.RegistrationStatus;
import com.example.se330.repository.GroupMemberRepository;
import com.example.se330.repository.ProjectRepository;
import com.example.se330.repository.RegistrationRepository;

@Service
@Transactional
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final ProjectRepository projectRepository;
    private final GroupMemberRepository groupMemberRepository;

    public RegistrationService(
            RegistrationRepository registrationRepository,
            ProjectRepository projectRepository,
            GroupMemberRepository groupMemberRepository) {
        this.registrationRepository = registrationRepository;
        this.projectRepository = projectRepository;
        this.groupMemberRepository = groupMemberRepository;
    }

    // Trưởng nhóm đề xuất đề tài (tên + mô tả) → tạo Project trạng thái PENDING
    // (ẩn khỏi danh sách cho tới khi duyệt) + Registration PENDING gắn nhóm.
    public RegistrationResponse proposeProject(
            Long courseId, Long groupId, String title, String description, Long userId) {

        GroupMember membership = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("Bạn không thuộc nhóm này"));
        Group group = membership.getGroup();

        if (group.getCourse() == null || !group.getCourse().getId().equals(courseId)) {
            throw new RuntimeException("Nhóm không thuộc lớp này");
        }
        if (group.getLeader() == null || !group.getLeader().getId().equals(userId)) {
            throw new RuntimeException("Chỉ Trưởng nhóm mới được đề xuất đề tài.");
        }
        if (title == null || title.isBlank()) {
            throw new RuntimeException("Tên đề tài không được để trống.");
        }

        boolean already = registrationRepository.existsByGroup_IdAndStatusIn(
                groupId, List.of(RegistrationStatus.PENDING, RegistrationStatus.APPROVED));
        if (already) {
            throw new RuntimeException("Nhóm đã có đề tài hoặc đề xuất đang chờ duyệt.");
        }

        Project project = projectRepository.save(Project.builder()
                .title(title)
                .description(description)
                .course(group.getCourse())
                .status(ProjectStatus.PENDING)
                .startDate(LocalDate.now())
                .build());

        Registration registration = Registration.builder()
                .project(project)
                .group(group)
                .status(RegistrationStatus.PENDING)
                .registeredAt(LocalDateTime.now())
                .build();

        return toResponse(registrationRepository.save(registration));
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getPending(Long courseId) {
        return registrationRepository
                .findByProject_Course_IdAndStatus(courseId, RegistrationStatus.PENDING)
                .stream().map(this::toResponse).toList();
    }

    public RegistrationResponse approve(Long registrationId, Long teacherId) {
        Registration registration = loadOwned(registrationId, teacherId);
        registration.setStatus(RegistrationStatus.APPROVED);
        registration.setApprovedAt(LocalDateTime.now());

        Project project = registration.getProject();
        if (project != null) {
            // Duyệt → đề tài thành đồ án đang thực hiện, hiện ở danh sách lớp + SV.
            project.setStatus(ProjectStatus.IN_PROGRESS);
            projectRepository.save(project);
        }

        return toResponse(registrationRepository.save(registration));
    }

    public RegistrationResponse reject(Long registrationId, Long teacherId) {
        Registration registration = loadOwned(registrationId, teacherId);
        RegistrationResponse resp = toResponse(registration);

        // Từ chối → xóa luôn project nháp (cascade xóa registration kèm theo).
        Project project = registration.getProject();
        if (project != null) {
            projectRepository.delete(project);
        } else {
            registrationRepository.delete(registration);
        }
        return resp;
    }

    private Registration loadOwned(Long registrationId, Long teacherId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu đăng ký"));

        Project project = registration.getProject();
        User lecturer = project != null && project.getCourse() != null
                ? project.getCourse().getLecturer() : null;
        if (lecturer == null || !lecturer.getId().equals(teacherId)) {
            throw new RuntimeException("Bạn không phải giảng viên của lớp này");
        }
        return registration;
    }

    private RegistrationResponse toResponse(Registration registration) {
        Project project = registration.getProject();
        Group group = registration.getGroup();
        User leader = group != null ? group.getLeader() : null;

        List<ProjectMemberResponse> members = group == null ? List.of()
                : group.getMembers().stream()
                        .filter(m -> m.getStatus() == GroupMemberStatus.ACTIVE && m.getUser() != null)
                        .map(m -> toMember(m.getUser()))
                        .toList();

        return RegistrationResponse.builder()
                .registrationId(registration.getRegistrationId())
                .projectId(project != null ? project.getId() : null)
                .projectTitle(project != null ? project.getTitle() : null)
                .projectDescription(project != null ? project.getDescription() : null)
                .groupId(group != null ? group.getId() : null)
                .groupName(group != null ? group.getName() : null)
                .leaderName(leader != null ? leader.getName() : null)
                .leaderAvatar(avatarOf(leader))
                .members(members)
                .status(registration.getStatus() != null ? registration.getStatus().name() : null)
                .registeredAt(registration.getRegisteredAt() != null
                        ? registration.getRegisteredAt().toString() : null)
                .build();
    }

    private ProjectMemberResponse toMember(User user) {
        return ProjectMemberResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .avatar(avatarOf(user))
                .build();
    }

    private String avatarOf(User user) {
        return user != null && user.getUserProfile() != null ? user.getUserProfile().getAvatarUrl() : null;
    }
}
