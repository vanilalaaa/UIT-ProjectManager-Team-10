package com.example.se330.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.se330.dto.UserDto;
import com.example.se330.dto.auth.AdminCreateUserRequest;
import com.example.se330.dto.auth.AdminUpdateUserRequest;
import com.example.se330.dto.auth.AdminUpdateUserStatusRequest;
import com.example.se330.entity.User;
import com.example.se330.enums.Role;
import com.example.se330.repository.UserRepository;
import com.example.se330.util.StudentCodeGenerator;
import com.example.se330.util.TeacherCodeGenerator;

@Service
public class AdminUserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StudentCodeGenerator studentCodeGenerator;
    private final TeacherCodeGenerator teacherCodeGenerator;

    public AdminUserService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            StudentCodeGenerator studentCodeGenerator,
            TeacherCodeGenerator teacherCodeGenerator) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.studentCodeGenerator = studentCodeGenerator;
        this.teacherCodeGenerator = teacherCodeGenerator;
    }

    public Page<UserDto> listUsers(int page, int size, String search, String role) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Role roleFilter = null;
        if (role != null && !role.isBlank()) {
            try {
                roleFilter = Role.valueOf(role.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // role không hợp lệ -> bỏ qua filter, trả về như không lọc
            }
        }

        String searchTerm = (search == null || search.isBlank()) ? null : search.trim();

        Page<User> users = userRepository.searchUsers(roleFilter, searchTerm, pageable);
        return users.map(this::toUserDto);
    }

    public UserDto createUser(AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        User user = User.builder()
                .uid(request.getRole() == Role.TEACHER
                        ? teacherCodeGenerator.generate()
                        : studentCodeGenerator.generate())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(request.getRole())
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(user);
        return toUserDto(saved);
    }

    public UserDto updateUser(Long id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email is already in use");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        user.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);
        return toUserDto(saved);
    }

    public UserDto updateUserStatus(Long id, AdminUpdateUserStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setIsActive(request.getIsActive());
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        return toUserDto(saved);
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return toUserDto(user);
    }

    public UserDto resetPassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        return toUserDto(saved);
    }

    private UserDto toUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .uid(user.getUid())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .build();
    }
}
