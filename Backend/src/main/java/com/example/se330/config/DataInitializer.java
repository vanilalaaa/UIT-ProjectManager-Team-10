package com.example.se330.config;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.se330.entity.Category;
import com.example.se330.entity.User;
import com.example.se330.enums.Role;
import com.example.se330.repository.CategoryRepository;
import com.example.se330.repository.UserRepository;
import com.example.se330.util.StudentCodeGenerator;
import com.example.se330.util.TeacherCodeGenerator;

import lombok.RequiredArgsConstructor;

/**
 * Khởi tạo những thứ TỐI THIỂU mà ứng dụng cần để chạy:
 * - Migration lược đồ (avatar_url -> LONGTEXT, status columns -> VARCHAR).
 * - 3 tài khoản đăng nhập gốc (admin/teacher/student).
 * - Danh mục (category) mặc định.
 *
 * KHÔNG seed dữ liệu demo/mock (lớp, nhóm, đồ án, task, bài nộp, điểm,
 * thông báo...). Mọi dữ liệu nghiệp vụ được tạo qua ứng dụng thật.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;
    private final StudentCodeGenerator studentCodeGenerator;
    private final TeacherCodeGenerator teacherCodeGenerator;
    private final JdbcTemplate jdbc;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbc.execute("ALTER TABLE user_profiles MODIFY COLUMN avatar_url LONGTEXT");
        } catch (Exception e) {
            System.out.println("Cột avatar_url chưa tồn tại hoặc đã được update.");
        }

        // Tài khoản gốc để đăng nhập lần đầu (mật khẩu 123123).
        ensureUser("admin@gmail.com", "Admin", Role.ADMIN);
        ensureUser("teacher@gmail.com", "Teacher", Role.TEACHER);
        ensureUser("student@gmail.com", "Student", Role.STUDENT);

        // Danh mục đề tài mặc định.
        seedCategory("Web App", "Ứng dụng web, API và quản lý dữ liệu");
        seedCategory("Research", "Đề tài nghiên cứu");
        seedCategory("Capstone", "Đồ án tốt nghiệp");
        seedCategory("UI/UX Design", "Thiết kế trải nghiệm người dùng");
        seedCategory("Paper", "Bài báo khoa học");

        // Các cột status từng được Hibernate tạo dạng MySQL ENUM với tập giá trị cũ;
        // ddl-auto=update không thêm giá trị enum mới (REVIEW/INVITED/PENDING) → đổi
        // sang VARCHAR để nhận mọi giá trị (an toàn, giữ nguyên dữ liệu).
        widenStatusColumns();

        backfillUids();
    }

    private void backfillUids() {
        for (User u : userRepository.findAll()) {
            String uid = u.getUid();
            String newUid = null;
            if (u.getRole() == Role.TEACHER) {
                if (uid == null || !uid.matches("^GV\\d{6}$")) {
                    newUid = teacherCodeGenerator.generate();
                }
            } else if (u.getRole() == Role.STUDENT) {
                if (uid == null || !uid.matches("^\\d{2}52\\d{4}$")) {
                    newUid = studentCodeGenerator.generate();
                }
            }
            if (newUid != null) {
                u.setUid(newUid);
                u.setUpdatedAt(LocalDateTime.now());
                userRepository.save(u);
            }
        }
    }

    private void widenStatusColumns() {
        for (String table : List.of("tasks", "group_members", "projects",
                "registrations", "submissions", "course_requests")) {
            // Bỏ CHECK constraint enum cũ (Hibernate tạo theo tập giá trị cũ; update
            // không cập nhật → chặn giá trị enum mới).
            try {
                List<String> checks = jdbc.queryForList(
                        "SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS "
                                + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_TYPE = 'CHECK'",
                        String.class, table);
                for (String chk : checks) {
                    try {
                        jdbc.execute("ALTER TABLE `" + table + "` DROP CHECK `" + chk + "`");
                    } catch (Exception ignored) {
                    }
                }
            } catch (Exception ignored) {
            }
            // Đổi cột status sang VARCHAR để nhận mọi giá trị enum (an toàn, giữ dữ liệu).
            try {
                jdbc.execute("ALTER TABLE `" + table + "` MODIFY COLUMN status VARCHAR(30)");
            } catch (Exception ignored) {
                // bảng/cột có thể chưa tồn tại ở lần chạy đầu — bỏ qua.
            }
        }
    }

    private User ensureUser(String email, String name, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setName(name);
            u.setEmail(email);
            u.setPassword(passwordEncoder.encode("123123"));
            u.setUid(role == Role.TEACHER ? teacherCodeGenerator.generate() : studentCodeGenerator.generate());
            u.setRole(role);
            u.setCreatedAt(LocalDateTime.now());
            u.setUpdatedAt(LocalDateTime.now());
            u.setIsActive(true);
            return userRepository.save(u);
        });
    }

    private void seedCategory(String name, String description) {
        if (!categoryRepository.existsByName(name)) {
            categoryRepository.save(Category.builder()
                    .name(name)
                    .description(description)
                    .isActive(true)
                    .build());
        }
    }
}
