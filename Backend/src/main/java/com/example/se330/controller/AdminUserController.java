package com.example.se330.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.UserDto;
import com.example.se330.dto.auth.AdminCreateUserRequest;
import com.example.se330.dto.auth.AdminResetPasswordRequest;
import com.example.se330.dto.auth.AdminUpdateUserRequest;
import com.example.se330.dto.auth.AdminUpdateUserStatusRequest;
import com.example.se330.service.AdminUserService;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {
    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserDto>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {

        Page<UserDto> users = adminUserService.listUsers(page, size, search, role);
        return ApiResponse.success(users, "Admin user list retrieved successfully");
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserDto>> createUser(
            @Valid @RequestBody AdminCreateUserRequest request) {

        UserDto userDto = adminUserService.createUser(request);
        return ApiResponse.created(userDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserRequest request) {

        UserDto userDto = adminUserService.updateUser(id, request);
        return ApiResponse.success(userDto, "User updated successfully");
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody AdminUpdateUserStatusRequest request) {

        UserDto userDto = adminUserService.updateUserStatus(id, request);
        return ApiResponse.success(userDto, "User status updated successfully");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(
            @PathVariable Long id) {

        UserDto userDto = adminUserService.getUserById(id);
        return ApiResponse.success(userDto, "User detail retrieved successfully");
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<ApiResponse<UserDto>> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody AdminResetPasswordRequest request) {

        UserDto userDto = adminUserService.resetPassword(id, request.getNewPassword());
        return ApiResponse.success(userDto, "Đặt lại mật khẩu thành công");
    }
}
