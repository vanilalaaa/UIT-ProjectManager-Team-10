package com.example.se330.config;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.se330.entity.User;
import com.example.se330.enums.Role;
import com.example.se330.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Tạo admin
        if (!userRepository.existsByEmail("admin@gmail.com")) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("123123"));
            admin.setUid(UUID.randomUUID().toString());
            admin.setRole(Role.ADMIN);
            admin.setCreatedAt(LocalDateTime.now());
            admin.setUpdatedAt(LocalDateTime.now());
            admin.setIsActive(true);
            userRepository.save(admin);
            System.out.println("Admin account created: admin@gmail.com / admin123");
        }

        // 2. Tạo Teacher
        if (!userRepository.existsByEmail("teacher@gmail.com")) {
            User teacher = new User();
            teacher.setName("Teacher");
            teacher.setEmail("teacher@gmail.com");
            teacher.setPassword(passwordEncoder.encode("123123"));
            teacher.setUid(UUID.randomUUID().toString());
            teacher.setRole(Role.TEACHER);
            teacher.setCreatedAt(LocalDateTime.now());
            teacher.setUpdatedAt(LocalDateTime.now());
            teacher.setIsActive(true);
            userRepository.save(teacher);
            System.out.println("Teacher account created: admin@gmail.com / admin123");
        }

        // 3. Tạo Student
        if (!userRepository.existsByEmail("student@gmail.com")) {
            User student = new User();
            student.setName("Student");
            student.setEmail("student@gmail.com");
            student.setPassword(passwordEncoder.encode("123123"));
            student.setUid(UUID.randomUUID().toString());
            student.setRole(Role.STUDENT);
            student.setCreatedAt(LocalDateTime.now());
            student.setUpdatedAt(LocalDateTime.now());
            student.setIsActive(true);
            userRepository.save(student);
            System.out.println("Student account created: admin@gmail.com / admin123");
        }
    }

}
