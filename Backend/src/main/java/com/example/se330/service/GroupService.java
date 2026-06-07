package com.example.se330.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.se330.dto.group.CreateGroupRequest;
import com.example.se330.dto.group.GroupMemberResponse;
import com.example.se330.dto.group.GroupResponse;
import com.example.se330.dto.group.UpdateGroupRequest;
import com.example.se330.entity.Group;
import com.example.se330.entity.GroupMember;
import com.example.se330.entity.User;
import com.example.se330.enums.GroupMemberStatus;
import com.example.se330.repository.GroupMemberRepository;
import com.example.se330.repository.GroupRepository;

@Service
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
        // 1. Kiểm tra Group có tồn tại không
        Group group = groupRepository.findByIdAndCourseId(groupId, courseId)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại trong môn học này!"));

        // 2. Bảo mật: Chỉ có Leader mới được quyền xem danh sách yêu cầu gia nhập nhóm
        // này
        if (!group.getLeader().getId().equals(leaderId)) {
            throw new RuntimeException("Bạn không có quyền xem danh sách yêu cầu. Chỉ có Trưởng nhóm mới xem được!");
        }

        // 3. Tìm tất cả bản ghi trong bảng GROUP_MEMBER có groupId này và status là
        // PENDING
        List<GroupMember> pendingMembers = groupMemberRepository.findByGroupIdAndStatus(groupId,
                GroupMemberStatus.PENDING);

        return pendingMembers.stream()
                .map(member -> new GroupMemberResponse(
                        member.getGroupMemberId(),
                        member.getUser().getName()))
                .collect(Collectors.toList());
    }

    public void reviewJoinRequest(Long leaderId, Long courseId, Long groupId, Long memberId, boolean approve) {
        // 1. Kiểm tra Group có tồn tại hay không
        Group group = groupRepository.findByIdAndCourseId(groupId, courseId)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại trong môn học này!"));

        // 2. Kiểm tra xem người đang gọi API có phải là Leader của nhóm này không
        if (!group.getLeader().getId().equals(leaderId)) {
            throw new RuntimeException("Bạn không có quyền duyệt thành viên. Chỉ có Trưởng nhóm mới có quyền này!");
        }

        // 3. Tìm yêu cầu xin vào nhóm (GroupMember) dựa trên memberId
        GroupMember memberRequest = groupMemberRepository.findByUserId(memberId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu gia nhập này!"));

        // 4. Kiểm tra xem yêu cầu này có thuộc đúng Group đang xử lý không
        if (!memberRequest.getGroup().getId().equals(groupId)) {
            throw new RuntimeException("Yêu cầu này không thuộc về nhóm của bạn!");
        }

        // 5. Kiểm tra xem trạng thái hiện tại có phải là PENDING không
        if (memberRequest.getStatus() != GroupMemberStatus.PENDING) {
            throw new RuntimeException("Yêu cầu này đã được xử lý từ trước!");
        }

        // 6. Thực hiện Duyệt hoặc Từ chối
        if (approve) {
            memberRequest.setStatus(GroupMemberStatus.ACTIVE);
            memberRequest.setJoinedDate(LocalDate.now());
            groupMemberRepository.save(memberRequest);
        } else {
            groupMemberRepository.delete(memberRequest);
        }
    }

    public List<GroupMemberResponse> getGroupMembers(Long courseId, Long groupId, GroupMemberStatus status) {
        List<GroupMember> members;

        if (status != null) {
            members = groupMemberRepository.findByGroupIdAndStatus(groupId, status);
        } else {
            // Nếu không truyền status, lấy tất cả thành viên bất kể trạng thái
            members = groupMemberRepository.findByGroupIdAndStatus(groupId, GroupMemberStatus.ACTIVE);
        }

        return members.stream()
                .map(member -> new GroupMemberResponse(
                        member.getGroupMemberId(),
                        member.getUser().getName()))
                .collect(Collectors.toList());
    }

    private GroupResponse mapToResponse(Group group) {
        if (group == null) {
            return null;
        }

        GroupResponse resp = new GroupResponse();
        resp.setGroupId(group.getId());
        resp.setName(group.getName());
        resp.setDescription(group.getDescription());
        resp.setCourseId(group.getCourse().getId());
        resp.setLeaderId(group.getLeader().getId());
        List<GroupMemberResponse> members = group.getMembers().stream()
                .map(member -> new GroupMemberResponse(member.getGroupMemberId(), member.getUser().getName()))
                .collect(Collectors.toList());
        resp.setMembers(members);
        return resp;
    }
}
