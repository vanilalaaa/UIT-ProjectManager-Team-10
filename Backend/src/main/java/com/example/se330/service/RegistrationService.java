package com.example.se330.service;

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

    // Sinh viên đăng ký nhóm (của mình trong lớp) cho 1 đề tài → PENDING.
    public RegistrationResponse register(Long courseId, Long projectId, Long studentId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đề tài"));

        if (project.getCourse() == null || !project.getCourse().getId().equals(courseId)) {
            throw new RuntimeException("Đề tài không thuộc lớp này");
        }

        GroupMember membership = groupMemberRepository
                .findFirstByUser_IdAndGroup_Course_Id(studentId, courseId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa thuộc nhóm nào trong lớp này"));
        Group group = membership.getGroup();

        boolean already = registrationRepository.existsByProject_IdAndGroup_IdAndStatusIn(
                projectId, group.getId(),
                List.of(RegistrationStatus.PENDING, RegistrationStatus.APPROVED));
        if (already) {
            throw new RuntimeException("Nhóm đã đăng ký đề tài này");
        }

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
            project.setStatus(ProjectStatus.ALLOCATED);
            projectRepository.save(project);
        }

        return toResponse(registrationRepository.save(registration));
    }

    public RegistrationResponse reject(Long registrationId, Long teacherId) {
        Registration registration = loadOwned(registrationId, teacherId);
        registration.setStatus(RegistrationStatus.REJECTED);
        return toResponse(registrationRepository.save(registration));
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
