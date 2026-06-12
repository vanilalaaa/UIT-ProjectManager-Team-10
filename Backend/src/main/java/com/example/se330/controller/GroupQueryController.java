package com.example.se330.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.group.GroupResponse;
import com.example.se330.service.GroupService;

// Lấy nhóm theo id (route FE màn chi tiết đồ án chỉ có groupId, không kèm courseId).
@RestController
@RequestMapping("/groups")
public class GroupQueryController {

    private final GroupService groupService;

    public GroupQueryController(GroupService groupService) {
        this.groupService = groupService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GroupResponse>> getGroup(@PathVariable Long id) {
        return ApiResponse.success(groupService.getGroupByIdOnly(id));
    }
}
