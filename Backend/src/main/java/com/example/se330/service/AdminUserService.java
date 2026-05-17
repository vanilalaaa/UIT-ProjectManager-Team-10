package com.example.se330.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.se330.dto.UserDto;
import com.example.se330.dto.auth.AdminCreateUserRequest;
import com.example.se330.dto.auth.AdminUpdateUserRequest;
import com.example.se330.entity.User;
import com.example.se330.repository.UserRepository;

@Service
public class AdminUserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(UserRepository userRepository,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<UserDto> listUsers(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<User> users;
        if (search == null || search.isBlank()) {
            users = userRepository.findAll(pageable);
        } else {
            users = userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search, pageable);
        }

        return users.map(this::toUserDto);
    }

    public UserDto createUser(AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }

        User user = User.builder()
                .uid(UUID.randomUUID().toString())
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

    private UserDto toUserDto(User user) {
        return UserDto.builder()
                .id(user.getUserId())
                .uid(user.getUid())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .build();
    }
}
