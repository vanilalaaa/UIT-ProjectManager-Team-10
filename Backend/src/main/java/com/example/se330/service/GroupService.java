package com.example.se330.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.se330.dto.group.CreateGroupRequest;
import com.example.se330.dto.group.GroupMemberResponse;
import com.example.se330.dto.group.GroupResponse;
import com.example.se330.dto.group.TransferLeaderRequest;
import com.example.se330.dto.group.UpdateGroupRequest;
import com.example.se330.entity.Group;
import com.example.se330.entity.GroupMember;
import com.example.se330.entity.User;
import com.example.se330.enums.GroupMemberStatus;
import com.example.se330.repository.GroupMemberRepository;
import com.example.se330.repository.GroupRepository;

@Service
@Transactional
public class GroupService {
    private final GroupRepository groupRepository;
    private final StudentService studentService;
    private final GroupMemberRepository groupMemberRepository;
    private final CourseService courseService;

    public GroupService(GroupRepository groupRepository, StudentService studentService,
            GroupMemberRepository groupMemberRepository, CourseService courseService) {
        this.groupRepository = groupRepository;
        this.studentService = studentService;
        this.groupMemberRepository = groupMemberRepository;
        this.courseService = courseService;
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

    // 5. [DELETE] Xóa Group và các bản ghi liên quan công việc/thành viên
    public void deleteGroup(Long userId, Long courseId, Long groupId) {
        Group group = groupRepository.findByIdAndCourseId(groupId, courseId)
                .orElseThrow(() -> new RuntimeException("Group not found in this course"));

        // Kiểm tra quyền: Chỉ Leader mới được xóa nhóm
        if (!group.getLeader().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to delete this group.");
        }

        // Xóa tất cả thành viên thuộc Group này trước để tránh lỗi liên kết
        groupMemberRepository.deleteByGroupId(groupId);
        groupRepository.delete(group);
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

        Long leaderId = group.getLeader() != null ? group.getLeader().getId() : null;
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
        GroupMember memberRequest = groupMemberRepository.findByUserId(memberId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu gia nhập này!"));
        if (!memberRequest.getGroup().getId().equals(groupId)) {
            throw new RuntimeException("Yêu cầu này không thuộc về nhóm của bạn!");
        }

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
        return groupMemberRepository.findFirstByUser_IdAndGroup_Course_Id(userId, courseId)
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

    public String removeGroupMember(Long leaderId, Long courseId, Long groupId, Long memberId) {

        Group group = groupRepository.findByIdAndCourseId(groupId, courseId)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại trong môn học này!"));

        if (!group.getLeader().getId().equals(leaderId)) {
            throw new RuntimeException("Bạn không có quyền xóa thành viên. Chỉ có Trưởng nhóm mới có quyền này!");
        }
        if (leaderId.equals(memberId)) {
            throw new RuntimeException("Trưởng nhóm không thể xóa chính mình khỏi nhóm!");
        }

        GroupMember memberToRemove = groupMemberRepository.findByGroupIdAndUserId(groupId, memberId)
                .orElseThrow(() -> new RuntimeException("Thành viên không tồn tại trong nhóm này!"));

        groupMemberRepository.delete(memberToRemove);

        return "Đã xóa thành viên khỏi nhóm thành công!";
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

        return GroupResponse.builder()
                .groupId(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .courseId(group.getCourse() != null ? group.getCourse().getId() : null)
                .leaderId(leaderId)
                .leaderName(group.getLeader() != null ? group.getLeader().getName() : null)
                .members(members)
                .memberCount(members.size())
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
