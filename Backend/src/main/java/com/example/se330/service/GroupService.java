package com.example.se330.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.se330.dto.group.CreateGroupRequest;
import com.example.se330.dto.group.GroupMemberResponse;
import com.example.se330.dto.group.GroupResponse;
import com.example.se330.dto.group.InvitationResponse;
import com.example.se330.dto.group.TransferLeaderRequest;
import com.example.se330.dto.group.UpdateGroupRequest;
import com.example.se330.entity.Course;
import com.example.se330.entity.Group;
import com.example.se330.entity.GroupMember;
import com.example.se330.entity.Registration;
import com.example.se330.entity.User;
import com.example.se330.enums.GroupMemberStatus;
import com.example.se330.enums.JoinStatus;
import com.example.se330.enums.RegistrationStatus;
import com.example.se330.enums.Role;
import com.example.se330.repository.CourseRequestRepository;
import com.example.se330.repository.GroupMemberRepository;
import com.example.se330.repository.GroupRepository;
import com.example.se330.repository.RegistrationRepository;

@Service
@Transactional
public class GroupService {
    private final GroupRepository groupRepository;
    private final StudentService studentService;
    private final GroupMemberRepository groupMemberRepository;
    private final CourseService courseService;
    private final CourseRequestRepository courseRequestRepository;
    private final RegistrationRepository registrationRepository;

    public GroupService(GroupRepository groupRepository, StudentService studentService,
            GroupMemberRepository groupMemberRepository, CourseService courseService,
            CourseRequestRepository courseRequestRepository, RegistrationRepository registrationRepository) {
        this.groupRepository = groupRepository;
        this.studentService = studentService;
        this.groupMemberRepository = groupMemberRepository;
        this.courseService = courseService;
        this.courseRequestRepository = courseRequestRepository;
        this.registrationRepository = registrationRepository;
    }

    public GroupResponse createGroup(Long userId, Long courseId, CreateGroupRequest request) {
        boolean alreadyInGroup = groupMemberRepository.existsByUserIdAndGroupCourseIdAndStatus(
                userId, courseId, GroupMemberStatus.ACTIVE);

        if (alreadyInGroup) {
            throw new RuntimeException(
                    "Bạn đã là thành viên của một nhóm khác trong môn học này, không thể tạo thêm nhóm mới!");
        }
        Group newGroup = new Group();
        newGroup.setName(request.getName());
        newGroup.setDescription(request.getDescription());
        newGroup.setCourse(courseService.getCourseById(courseId));
        User leader = studentService.getStudentById(userId);
        newGroup.setLeader(leader);

        Group savedGroup = groupRepository.save(newGroup);

        GroupMember groupMember = new GroupMember();
        groupMember.setUser(leader);
        groupMember.setGroup(savedGroup);
        groupMember.setJoinedDate(LocalDate.now());
        groupMember.setCreatedAt(LocalDateTime.now());
        groupMember.setStatus(GroupMemberStatus.ACTIVE);

        groupMemberRepository.save(groupMember);

        if (savedGroup.getMembers() == null) {
            savedGroup.setMembers(new ArrayList<>());
        }
        savedGroup.getMembers().add(groupMember);

        return mapToResponse(savedGroup);
    }

    // 2. Lấy danh sách Group theo Course ID
    public List<GroupResponse> getGroupsByCourseId(Long courseId) {
        List<Group> groups = groupRepository.findByCourseId(courseId);
        return groups.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 3. [READ ONE] Lấy chi tiết 1 Group
    public GroupResponse getGroupById(Long courseId, Long groupId) {
        Group group = groupRepository.findByIdAndCourseId(groupId, courseId)
                .orElseThrow(() -> new RuntimeException("Group not found in this course"));
        return mapToResponse(group);
    }

    // 4. [UPDATE] Cập nhật thông tin Group
    public GroupResponse updateGroup(Long userId, Long courseId, Long groupId, UpdateGroupRequest request) {
        Group group = groupRepository.findByIdAndCourseId(groupId, courseId)
                .orElseThrow(() -> new RuntimeException("Group not found in this course"));

        // Kiểm tra quyền: Chỉ Leader mới được cập nhật thông tin nhóm
        if (!group.getLeader().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to update this group. Only the leader can.");
        }

        group.setName(request.getName());
        group.setDescription(request.getDescription());

        Group updatedGroup = groupRepository.save(group);
        return mapToResponse(updatedGroup);
    }

    // 5. [DELETE] Xóa Group — Leader của nhóm, GV của lớp, hoặc Admin.
    public void deleteGroup(Long userId, Long courseId, Long groupId) {
        Group group = groupRepository.findByIdAndCourseId(groupId, courseId)
                .orElseThrow(() -> new RuntimeException("Group not found in this course"));

        assertCanManageGroup(group, userId);

        // Xóa tất cả thành viên thuộc Group này trước để tránh lỗi liên kết
        groupMemberRepository.deleteByGroupId(groupId);
        groupRepository.delete(group);
    }

    // Sinh viên tự rời nhóm. Leader chỉ rời được khi là thành viên duy nhất
    // (nhóm sẽ bị giải tán); còn thành viên khác thì phải chuyển quyền trước.
    public void leaveGroup(Long userId, Long courseId, Long groupId) {
        Group group = groupRepository.findByIdAndCourseId(groupId, courseId)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại trong môn học này!"));

        GroupMember membership = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("Bạn không thuộc nhóm này!"));

        boolean isLeader = group.getLeader() != null && group.getLeader().getId().equals(userId);
        if (isLeader) {
            long activeOthers = groupMemberRepository.findByGroupIdAndStatus(groupId, GroupMemberStatus.ACTIVE)
                    .stream()
                    .filter(m -> m.getUser() != null && !m.getUser().getId().equals(userId))
                    .count();
            if (activeOthers > 0) {
                throw new RuntimeException(
                        "Bạn là Trưởng nhóm — hãy chuyển quyền cho thành viên khác trước khi rời nhóm.");
            }
            // Leader là thành viên duy nhất → giải tán nhóm.
            groupMemberRepository.deleteByGroupId(groupId);
            groupRepository.delete(group);
            return;
        }

        groupMemberRepository.delete(membership);
    }

    // 6. Gửi yêu cầu tham gia nhóm
    public void requestToJoinGroup(Long userId, Long courseId, Long groupId) {
        Group group = groupRepository.findByIdAndCourseId(groupId, courseId)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại trong môn học này!"));

        User student = studentService.getStudentById(userId);

        // 3. Kiểm tra xem User đã gửi yêu cầu hoặc đã là thành viên của nhóm này chưa
        Optional<GroupMember> existingMember = groupMemberRepository.findByGroupIdAndUserId(groupId, userId);

        if (existingMember.isPresent()) {
            GroupMemberStatus status = existingMember.get().getStatus();
            if (status == GroupMemberStatus.PENDING) {
                throw new RuntimeException("Bạn đã gửi yêu cầu tham gia nhóm này rồi, vui lòng chờ duyệt!");
            } else if (status == GroupMemberStatus.ACTIVE) {
                throw new RuntimeException("Bạn đã là thành viên chính thức của nhóm này!");
            } else if (status == GroupMemberStatus.INVITED) {
                throw new RuntimeException("Bạn đã được mời vào nhóm này — vào mục Lời mời để chấp nhận.");
            }
        }

        // 4. Kiểm tra xem User này đã tham gia bất kỳ nhóm nào KHÁC trong cùng môn học
        // chưa
        boolean alreadyInAnotherGroup = groupMemberRepository.existsByUserIdAndGroupCourseIdAndStatus(
                userId, courseId, GroupMemberStatus.ACTIVE);
        if (alreadyInAnotherGroup) {
            throw new RuntimeException("Bạn đã tham gia một nhóm khác trong môn học này rồi!");
        }

        // 5. Thêm bản ghi mới vào bảng GROUP_MEMBER với trạng thái PENDING
        GroupMember newRequest = new GroupMember();
        newRequest.setUser(student);
        newRequest.setGroup(group);
        newRequest.setJoinedDate(LocalDate.now());
        newRequest.setCreatedAt(LocalDateTime.now());
        newRequest.setStatus(GroupMemberStatus.PENDING);

        groupMemberRepository.save(newRequest);
    }

    public List<GroupMemberResponse> getJoinRequests(Long leaderId, Long courseId, Long groupId) {
        Group group = groupRepository.findByIdAndCourseId(groupId, courseId)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại trong môn học này!"));

        if (!group.getLeader().getId().equals(leaderId)) {
            throw new RuntimeException("Bạn không có quyền xem danh sách yêu cầu. Chỉ có Trưởng nhóm mới xem được!");
        }

        List<GroupMember> pendingMembers = groupMemberRepository.findByGroupIdAndStatus(groupId,
                GroupMemberStatus.PENDING);

        // leaderId (tham số) chính là id Trưởng nhóm — đã validate ở trên.
        return pendingMembers.stream()
                .map(member -> toMemberResponse(member, leaderId))
                .collect(Collectors.toList());
    }

    public void reviewJoinRequest(Long leaderId, Long courseId, Long groupId, Long memberId, boolean approve) {

        Group group = groupRepository.findByIdAndCourseId(groupId, courseId)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại trong môn học này!"));

        if (!group.getLeader().getId().equals(leaderId)) {
            throw new RuntimeException("Bạn không có quyền duyệt thành viên. Chỉ có Trưởng nhóm mới có quyền này!");
        }
        // Phải khóa theo (group, user): 1 user có thể có nhiều bản ghi GroupMember ở
        // các nhóm khác nhau → findByUserId trả >1 và ném "non-unique result".
        GroupMember memberRequest = groupMemberRepository.findByGroupIdAndUserId(groupId, memberId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu gia nhập này!"));

        if (memberRequest.getStatus() != GroupMemberStatus.PENDING) {
            throw new RuntimeException("Yêu cầu này đã được xử lý từ trước!");
        }

        if (approve) {
            memberRequest.setStatus(GroupMemberStatus.ACTIVE);
            memberRequest.setJoinedDate(LocalDate.now());
            groupMemberRepository.save(memberRequest);
        } else {
            groupMemberRepository.delete(memberRequest);
        }
    }

    public List<GroupMemberResponse> getGroupMembers(Long courseId, Long groupId, GroupMemberStatus status) {
        Group group = groupRepository.findByIdAndCourseId(groupId, courseId)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại trong môn học này!"));
        Long leaderId = group.getLeader() != null ? group.getLeader().getId() : null;

        GroupMemberStatus filter = status != null ? status : GroupMemberStatus.ACTIVE;
        return groupMemberRepository.findByGroupIdAndStatus(groupId, filter).stream()
                .map(member -> toMemberResponse(member, leaderId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GroupResponse getGroupByIdOnly(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return mapToResponse(group);
    }

    @Transactional(readOnly = true)
    public GroupResponse getMyGroup(Long userId, Long courseId) {
        // Chỉ tính thành viên ACTIVE. Người mới được mời (INVITED) hoặc đang chờ duyệt
        // (PENDING) chưa thuộc nhóm → trả null để họ thấy màn hình "lời mời / tạo nhóm".
        return groupMemberRepository
                .findFirstByUser_IdAndGroup_Course_IdAndStatus(userId, courseId, GroupMemberStatus.ACTIVE)
                .map(GroupMember::getGroup)
                .map(this::mapToResponse)
                .orElse(null);
    }
    public GroupResponse transferLeaderRole(Long currentLeaderId, Long courseId, Long groupId, Long newLeaderId) {

        Group group = groupRepository.findByIdAndCourseId(groupId, courseId)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại trong môn học này!"));

        if (!group.getLeader().getId().equals(currentLeaderId)) {
            throw new RuntimeException(
                    "Bạn không có quyền chuyển quyền Trưởng nhóm. Chỉ có Trưởng nhóm hiện tại mới có quyền này!");
        }

        if (currentLeaderId.equals(newLeaderId)) {
            throw new RuntimeException("Không thể chuyển quyền Trưởng nhóm cho chính mình!");
        }

        GroupMember newLeaderMember = groupMemberRepository.findByGroupIdAndUserId(groupId, newLeaderId)
                .orElseThrow(() -> new RuntimeException("Thành viên mới không tồn tại trong nhóm này!"));

        if (newLeaderMember.getStatus() != GroupMemberStatus.ACTIVE) {
            throw new RuntimeException("Chỉ có thành viên chính thức (ACTIVE) mới được chuyển thành Trưởng nhóm!");
        }

        User newLeader = newLeaderMember.getUser();

        group.setLeader(newLeader);
        Group updatedGroup = groupRepository.save(group);

        return mapToResponse(updatedGroup);
    }

    // Xóa thành viên khỏi nhóm — Leader của nhóm, GV của lớp, hoặc Admin.
    public String removeGroupMember(Long actorId, Long courseId, Long groupId, Long memberId) {

        Group group = groupRepository.findByIdAndCourseId(groupId, courseId)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại trong môn học này!"));

        assertCanManageGroup(group, actorId);

        if (group.getLeader() != null && group.getLeader().getId().equals(memberId)) {
            throw new RuntimeException("Không thể xóa Trưởng nhóm khỏi nhóm. Hãy chuyển quyền trước.");
        }

        GroupMember memberToRemove = groupMemberRepository.findByGroupIdAndUserId(groupId, memberId)
                .orElseThrow(() -> new RuntimeException("Thành viên không tồn tại trong nhóm này!"));

        groupMemberRepository.delete(memberToRemove);

        return "Đã xóa thành viên khỏi nhóm thành công!";
    }

    // ---- Mời thành viên / lời mời ----

    // Sinh viên đã tham gia lớp (để trưởng nhóm chọn mời + màn Thành viên lớp).
    @Transactional(readOnly = true)
    public List<GroupMemberResponse> getCourseClassmates(Long courseId) {
        Course course = courseService.getCourseById(courseId);
        return courseRequestRepository.findAllByCourseAndStatus(course, JoinStatus.ACTIVE).stream()
                .map(cr -> cr.getStudent())
                .filter(u -> u != null)
                .map(student -> toClassmate(student, groupMemberRepository.existsByUser_IdAndGroup_Course_IdAndStatusIn(
                        student.getId(), courseId,
                        List.of(GroupMemberStatus.ACTIVE, GroupMemberStatus.INVITED, GroupMemberStatus.PENDING))))
                .collect(Collectors.toList());
    }

    // Trưởng nhóm mời 1 sinh viên vào nhóm → GroupMember status INVITED (chờ SV chấp nhận).
    public void inviteMember(Long leaderId, Long courseId, Long groupId, Long invitedUserId) {
        Group group = groupRepository.findByIdAndCourseId(groupId, courseId)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại trong môn học này!"));
        if (group.getLeader() == null || !group.getLeader().getId().equals(leaderId)) {
            throw new RuntimeException("Chỉ Trưởng nhóm mới được mời thành viên.");
        }
        User invited = studentService.getStudentById(invitedUserId);

        courseRequestRepository.findByCourse_IdAndStudent_Id(courseId, invitedUserId)
                .filter(cr -> cr.getStatus() == JoinStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("Sinh viên này chưa tham gia lớp, không thể mời."));

        groupMemberRepository.findByGroupIdAndUserId(groupId, invitedUserId).ifPresent(gm -> {
            throw new RuntimeException("Sinh viên này đã ở trong nhóm hoặc đã được mời/đăng ký.");
        });
        boolean inAnotherGroup = groupMemberRepository.existsByUserIdAndGroupCourseIdAndStatus(
                invitedUserId, courseId, GroupMemberStatus.ACTIVE);
        if (inAnotherGroup) {
            throw new RuntimeException("Sinh viên này đã thuộc một nhóm khác trong lớp.");
        }

        GroupMember invitation = new GroupMember();
        invitation.setGroup(group);
        invitation.setUser(invited);
        invitation.setJoinedDate(LocalDate.now());
        invitation.setCreatedAt(LocalDateTime.now());
        invitation.setStatus(GroupMemberStatus.INVITED);
        groupMemberRepository.save(invitation);
    }

    // Lời mời nhóm gửi đến sinh viên đang đăng nhập.
    @Transactional(readOnly = true)
    public List<InvitationResponse> getMyInvitations(Long userId) {
        return groupMemberRepository.findByUser_IdAndStatus(userId, GroupMemberStatus.INVITED).stream()
                .map(this::toInvitation)
                .collect(Collectors.toList());
    }

    // SV chấp nhận lời mời → INVITED -> ACTIVE (gia nhập nhóm).
    public void acceptInvitation(Long userId, Long groupMemberId) {
        GroupMember invitation = loadOwnInvitation(userId, groupMemberId);
        Long courseId = invitation.getGroup() != null && invitation.getGroup().getCourse() != null
                ? invitation.getGroup().getCourse().getId() : null;
        if (courseId != null && groupMemberRepository.existsByUserIdAndGroupCourseIdAndStatus(
                userId, courseId, GroupMemberStatus.ACTIVE)) {
            throw new RuntimeException("Bạn đã thuộc một nhóm khác trong lớp này.");
        }
        invitation.setStatus(GroupMemberStatus.ACTIVE);
        invitation.setJoinedDate(LocalDate.now());
        groupMemberRepository.save(invitation);
    }

    // SV từ chối lời mời → xóa bản ghi INVITED.
    public void declineInvitation(Long userId, Long groupMemberId) {
        groupMemberRepository.delete(loadOwnInvitation(userId, groupMemberId));
    }

    private GroupMember loadOwnInvitation(Long userId, Long groupMemberId) {
        GroupMember invitation = groupMemberRepository.findById(groupMemberId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời!"));
        if (invitation.getUser() == null || !invitation.getUser().getId().equals(userId)
                || invitation.getStatus() != GroupMemberStatus.INVITED) {
            throw new RuntimeException("Lời mời không hợp lệ.");
        }
        return invitation;
    }

    private GroupMemberResponse toClassmate(User user, boolean grouped) {
        return GroupMemberResponse.builder()
                .groupMemberId(null)
                .userId(user.getId())
                .name(user.getName())
                .avatar(user.getUserProfile() != null ? user.getUserProfile().getAvatarUrl() : null)
                .summary(user.getUserProfile() != null ? user.getUserProfile().getSummary() : null)
                .uid(user.getUid())
                .email(user.getEmail())
                .isLeader(false)
                // "ACTIVE" = đã có nhóm (FE ẩn nút mời); "FREE" = chưa có nhóm.
                .status(grouped ? GroupMemberStatus.ACTIVE.name() : "FREE")
                .build();
    }

    private InvitationResponse toInvitation(GroupMember invitation) {
        Group group = invitation.getGroup();
        long activeCount = group == null ? 0
                : group.getMembers().stream().filter(m -> m.getStatus() == GroupMemberStatus.ACTIVE).count();
        return InvitationResponse.builder()
                .groupMemberId(invitation.getGroupMemberId())
                .groupId(group != null ? group.getId() : null)
                .groupName(group != null ? group.getName() : null)
                .courseId(group != null && group.getCourse() != null ? group.getCourse().getId() : null)
                .courseName(group != null && group.getCourse() != null ? group.getCourse().getName() : null)
                .leaderName(group != null && group.getLeader() != null ? group.getLeader().getName() : null)
                .memberCount((int) activeCount)
                .build();
    }

    // Quyền quản lý nhóm: Leader của nhóm, GV phụ trách lớp, hoặc Admin.
    private void assertCanManageGroup(Group group, Long actorId) {
        boolean isLeader = group.getLeader() != null && group.getLeader().getId().equals(actorId);
        boolean isCourseTeacher = group.getCourse() != null && group.getCourse().getLecturer() != null
                && group.getCourse().getLecturer().getId().equals(actorId);
        boolean isAdmin = studentService.getStudentById(actorId).getRole() == Role.ADMIN;
        if (!isLeader && !isCourseTeacher && !isAdmin) {
            throw new RuntimeException("Bạn không có quyền quản lý nhóm này.");
        }
    }

    private GroupResponse mapToResponse(Group group) {
        if (group == null) {
            return null;
        }

        Long leaderId = group.getLeader() != null ? group.getLeader().getId() : null;
        List<GroupMemberResponse> members = group.getMembers().stream()
                .filter(m -> m.getStatus() == GroupMemberStatus.ACTIVE)
                .map(m -> toMemberResponse(m, leaderId))
                .collect(Collectors.toList());

        Registration projectReg = registrationRepository.findFirstByGroup_IdAndStatusIn(
                group.getId(), List.of(RegistrationStatus.PENDING, RegistrationStatus.APPROVED)).orElse(null);

        return GroupResponse.builder()
                .groupId(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .courseId(group.getCourse() != null ? group.getCourse().getId() : null)
                .leaderId(leaderId)
                .leaderName(group.getLeader() != null ? group.getLeader().getName() : null)
                .members(members)
                .memberCount(members.size())
                .projectStatus(projectReg != null && projectReg.getStatus() != null ? projectReg.getStatus().name() : null)
                .projectTitle(projectReg != null && projectReg.getProject() != null ? projectReg.getProject().getTitle() : null)
                .build();
    }

    private GroupMemberResponse toMemberResponse(GroupMember member, Long leaderId) {
        User user = member.getUser();
        boolean leader = leaderId != null && user != null && leaderId.equals(user.getId());
        return GroupMemberResponse.builder()
                .groupMemberId(member.getGroupMemberId())
                .userId(user != null ? user.getId() : null)
                .name(user != null ? user.getName() : null)
                .avatar(user != null && user.getUserProfile() != null ? user.getUserProfile().getAvatarUrl() : null)
                .summary(user != null && user.getUserProfile() != null ? user.getUserProfile().getSummary() : null)
                .uid(user != null ? user.getUid() : null)
                .email(user != null ? user.getEmail() : null)
                .isLeader(leader)
                .status(member.getStatus() != null ? member.getStatus().name() : null)
                .build();
    }
}
