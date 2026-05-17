package com.example.se330.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.se330.dto.UserDto;
import com.example.se330.entity.User;
import com.example.se330.repository.UserRepository;

@Service
public class AdminUserService {
    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
