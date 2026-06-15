package com.example.se330.util;

import java.security.SecureRandom;
import java.time.Year;

import org.springframework.stereotype.Component;

import com.example.se330.repository.UserRepository;

/**
 * Sinh mã định danh (uid) theo mẫu mã sinh viên UIT gồm 8 chữ số,
 * ví dụ: 24522065, 22521074. Mã được sinh tự động và đảm bảo không trùng.
 */
@Component
public class StudentCodeGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final String FACULTY_PREFIX = "52";
    private static final int MAX_ATTEMPTS = 100;

    private final UserRepository userRepository;

    public StudentCodeGenerator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** Sinh một mã 8 chữ số duy nhất: YY + "52" + 4 chữ số ngẫu nhiên. */
    public String generate() {
        String yearPrefix = String.format("%02d", Year.now().getValue() % 100);

        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            String suffix = String.format("%04d", RANDOM.nextInt(10000));
            String code = yearPrefix + FACULTY_PREFIX + suffix;
            if (!userRepository.existsByUid(code)) {
                return code;
            }
        }
        throw new IllegalStateException("Không thể sinh mã sinh viên duy nhất sau " + MAX_ATTEMPTS + " lần thử");
    }
}
