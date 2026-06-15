package com.example.se330.util;

import java.security.SecureRandom;
import java.time.Year;

import org.springframework.stereotype.Component;

import com.example.se330.repository.UserRepository;


@Component
public class TeacherCodeGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String PREFIX = "GV";
    private static final int MAX_ATTEMPTS = 100;

    private final UserRepository userRepository;

    public TeacherCodeGenerator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String generate() {
        String yearPrefix = String.format("%02d", Year.now().getValue() % 100);

        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            String suffix = String.format("%04d", RANDOM.nextInt(10000));
            String code = PREFIX + yearPrefix + suffix;
            if (!userRepository.existsByUid(code)) {
                return code;
            }
        }
        throw new IllegalStateException("Không thể sinh mã giảng viên duy nhất sau " + MAX_ATTEMPTS + " lần thử");
    }
}
