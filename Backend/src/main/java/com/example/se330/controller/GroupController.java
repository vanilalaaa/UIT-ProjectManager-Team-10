package com.example.se330.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.group.CreateGroupRequest;
import com.example.se330.dto.group.GroupMemberResponse;
import com.example.se330.dto.group.GroupResponse;
import com.example.se330.dto.group.UpdateGroupRequest;
import com.example.se330.enums.GroupMemberStatus;
import com.example.se330.security.CustomUserDetails;
import com.example.se330.service.GroupService;

@RestController
@RequestMapping("/courses/{courseId}/groups")
public class GroupController {
    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GroupResponse>> createGroup(
            Authentication authentication, @PathVariable Long courseId,
            @RequestBody CreateGroupRequest request) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        GroupResponse resp = groupService.createGroup(userDetails.getId(), courseId, request);
        return ApiResponse.success(resp);
    }

    // [READ ALL] Lấy danh sách group theo Course ID
    @GetMapping
    public ResponseEntity<ApiResponse<List<GroupResponse>>> getGroupsByCourseId(@PathVariable Long courseId) {
        List<GroupResponse> groups = groupService.getGroupsByCourseId(courseId);
        return ApiResponse.success(groups);
    }

    // [READ ONE] Lấy chi tiết 1 group cụ thể
    @GetMapping("/{groupId}")
    public ResponseEntity<ApiResponse<GroupResponse>> getGroupById(
            @PathVariable Long courseId,
            @PathVariable Long groupId) {
        GroupResponse group = groupService.getGroupById(courseId, groupId);
        return ApiResponse.success(group);
    }

    // [UPDATE] Cập nhật thông tin group (Chỉ Leader được phép sửa)
    @PutMapping("/{groupId}")
    public ResponseEntity<ApiResponse<GroupResponse>> updateGroup(
            Authentication authentication,
            @PathVariable Long courseId,
            @PathVariable Long groupId,
            @RequestBody UpdateGroupRequest request) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        GroupResponse updatedGroup = groupService.updateGroup(userDetails.getId(), courseId, groupId, request);
        return ApiResponse.success(updatedGroup);
    }

    // [DELETE] Xóa group (Chỉ Leader được phép xóa)
    @DeleteMapping("/{groupId}")
    public ResponseEntity<ApiResponse<Void>> deleteGroup(
            Authentication authentication,
            @PathVariable Long courseId,
            @PathVariable Long groupId) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        groupService.deleteGroup(userDetails.getId(), courseId, groupId);
        return ApiResponse.success(null); // Hoặc trả về thông báo xóa thành công tùy cấu trúc ApiResponse
    }

    // Gửi lời yêu cầu tham gia nhóm (Student gửi yêu cầu, Leader duyệt)
    @PostMapping("/{groupId}/join")
    public ResponseEntity<ApiResponse<String>> joinGroup(
            Authentication authentication,
            @PathVariable Long courseId,
            @PathVariable Long groupId) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        groupService.requestToJoinGroup(userDetails.getId(), courseId, groupId);

        return ApiResponse.success("Gửi yêu cầu tham gia nhóm thành công! Vui lòng chờ Trưởng nhóm duyệt.");
    }

    // Danh sách các yêu cầu tham gia nhóm đang ở trạng thái PENDING (Chỉ Leader mới
    // xem được)
    @GetMapping("/{groupId}/join-requests")
    public ResponseEntity<ApiResponse<List<GroupMemberResponse>>> getJoinRequests(
            Authentication authentication,
            @PathVariable Long courseId,
            @PathVariable Long groupId) {

        // Lấy thông tin Leader đang đăng nhập
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        // Gọi service lấy danh sách các yêu cầu PENDING
        List<GroupMemberResponse> requests = groupService.getJoinRequests(userDetails.getId(), courseId, groupId);

        return ApiResponse.success(requests);
    }

    // Leader duyệt yêu cầu tham gia nhóm
    @PutMapping("/{groupId}/members/{memberId}/review")
    public ResponseEntity<ApiResponse<String>> reviewJoinRequest(
            Authentication authentication,
            @PathVariable Long courseId,
            @PathVariable Long groupId,
            @PathVariable Long memberId, // Đây là ID của bản ghi GroupMember cần duyệt
            @RequestParam boolean approve) {

        // Lấy thông tin người đang thực hiện thao tác duyệt (phải là Leader)
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        groupService.reviewJoinRequest(userDetails.getId(), courseId, groupId, memberId, approve);

        String message = approve ? "Đã duyệt thành viên vào nhóm!" : "Đã từ chối yêu cầu vào nhóm!";
        return ApiResponse.success(message);
    }

    // Lấy danh sách thành viên trong nhóm theo trạng thái (ACTIVE/PENDING)
    @GetMapping("/{groupId}/members")
    public ResponseEntity<ApiResponse<List<GroupMemberResponse>>> getGroupMembers(
            @PathVariable Long courseId,
            @PathVariable Long groupId,
            @RequestParam(required = false) GroupMemberStatus status) { // Trạng thái tùy chọn (ACTIVE/PENDING)

        List<GroupMemberResponse> members = groupService.getGroupMembers(courseId, groupId, status);
        return ApiResponse.success(members);
    }
}
