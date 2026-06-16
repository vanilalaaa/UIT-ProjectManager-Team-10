package com.example.se330.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.se330.entity.Category;
import com.example.se330.entity.Course;
import com.example.se330.entity.CourseRequest;
import com.example.se330.entity.Grade;
import com.example.se330.entity.GradeCriterionScore;
import com.example.se330.entity.Group;
import com.example.se330.entity.GroupMember;
import com.example.se330.entity.Notification;
import com.example.se330.entity.Project;
import com.example.se330.entity.Registration;
import com.example.se330.entity.Requirement;
import com.example.se330.entity.RubricCriterion;
import com.example.se330.entity.Submission;
import com.example.se330.entity.Task;
import com.example.se330.entity.User;
import com.example.se330.enums.GroupMemberStatus;
import com.example.se330.enums.JoinStatus;
import com.example.se330.enums.ProjectStatus;
import com.example.se330.enums.RegistrationStatus;
import com.example.se330.enums.Role;
import com.example.se330.enums.SubmissionStatus;
import com.example.se330.enums.TaskStatus;
import com.example.se330.repository.CategoryRepository;
import com.example.se330.repository.CourseRepository;
import com.example.se330.repository.CourseRequestRepository;
import com.example.se330.repository.GradeRepository;
import com.example.se330.repository.GroupMemberRepository;
import com.example.se330.repository.GroupRepository;
import com.example.se330.repository.NotificationRepository;
import com.example.se330.repository.ProjectRepository;
import com.example.se330.repository.RegistrationRepository;
import com.example.se330.repository.RequirementRepository;
import com.example.se330.repository.SubmissionRepository;
import com.example.se330.repository.TaskRepository;
import com.example.se330.repository.UserRepository;
import com.example.se330.util.StudentCodeGenerator;
import com.example.se330.util.TeacherCodeGenerator;

import lombok.RequiredArgsConstructor;

/**
 * Khởi tạo schema migration + tài khoản gốc + danh mục, và seed dữ liệu DEMO
 * phong phú (idempotent qua marker sv1@uit.edu.vn) để chạy thử mọi tình huống.
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

    private final CourseRepository courseRepository;
    private final CourseRequestRepository courseRequestRepository;
    private final RequirementRepository requirementRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final RegistrationRepository registrationRepository;
    private final ProjectRepository projectRepository;
    private final SubmissionRepository submissionRepository;
    private final GradeRepository gradeRepository;
    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;

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

        try {
            seedDemoData();
        } catch (Exception e) {
            System.out.println("Seed dữ liệu demo lỗi (bỏ qua): " + e.getMessage());
        }
    }

    // ---------------------------------------------------------------------
    // Demo data: 1 admin + 5 GV + 20 SV + lớp/nhóm/đồ án/nộp bài/điểm/task/thông báo
    // đủ các trạng thái. Tài khoản demo: gv1..gv5@uit.edu.vn, sv1..sv20@uit.edu.vn
    // (mật khẩu 123123). admin dùng lại admin@gmail.com.
    // ---------------------------------------------------------------------
    private void seedDemoData() {
        if (userRepository.findByEmail("sv1@uit.edu.vn").isPresent()) {
            return; // đã seed
        }

        String[] teacherNames = {
                "Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường", "Phạm Thị Dung", "Hoàng Văn Em"
        };
        List<User> t = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            t.add(ensureUser("gv" + (i + 1) + "@uit.edu.vn", teacherNames[i], Role.TEACHER));
        }

        String[] studentNames = {
                "Trần Văn Bảo", "Lê Thị Cúc", "Phạm Văn Dũng", "Hoàng Thị Em", "Vũ Văn Phúc",
                "Đặng Thị Giang", "Bùi Văn Hùng", "Đỗ Thị Hoa", "Hồ Văn Khoa", "Ngô Thị Lan",
                "Dương Văn Minh", "Lý Thị Nga", "Phan Văn Phong", "Võ Thị Quỳnh", "Đinh Văn Sơn",
                "Tô Thị Trang", "Mai Văn Uy", "Chu Thị Vân", "Đào Văn Xuân", "Cao Thị Yến"
        };
        List<User> s = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            s.add(ensureUser("sv" + (i + 1) + "@uit.edu.vn", studentNames[i], Role.STUDENT));
        }

        Category webCat = cat("Web App");
        Category aiCat = cat("Research");
        LocalDate today = LocalDate.now();

        // --- Lớp học (có lớp đang mở, lớp đã quá hạn) ---
        Course c1 = course("SE330O11", "Lập trình Web nâng cao - SE330.O11", t.get(0), today.minusMonths(1), today.plusMonths(2));
        Course c2 = course("IT005O12", "Cơ sở dữ liệu - IT005.O12", t.get(1), today.minusMonths(1), today.plusMonths(2));
        Course c3 = course("CS106P21", "Trí tuệ nhân tạo - CS106.P21", t.get(2), today.minusMonths(2), today.minusWeeks(1));
        Course c4 = course("SE104N15", "Nhập môn CNPM - SE104.N15", t.get(3), today.minusWeeks(2), today.plusMonths(3));
        Course c5 = course("SE121M11", "Đồ án 1 - SE121.M11", t.get(4), today.minusMonths(1), today.plusMonths(2));
        course("SE114O13", "Kiểm thử phần mềm - SE114.O13", t.get(0), today.minusWeeks(3), today.plusMonths(1));

        // --- Ghi danh (ACTIVE = đã vào lớp, PENDING = chờ duyệt) ---
        for (int i = 0; i <= 9; i++) enroll(s.get(i), c1, JoinStatus.ACTIVE);
        enroll(s.get(10), c1, JoinStatus.PENDING);
        for (int i = 8; i <= 15; i++) enroll(s.get(i), c2, JoinStatus.ACTIVE);
        for (int i = 10; i <= 14; i++) enroll(s.get(i), c3, JoinStatus.ACTIVE);
        for (int i = 0; i <= 5; i++) enroll(s.get(i), c4, JoinStatus.ACTIVE);
        for (int i = 13; i <= 18; i++) enroll(s.get(i), c5, JoinStatus.ACTIVE);
        // s.get(19): chưa vào lớp nào (free)

        // --- Yêu cầu đồ án + barem (lớp có / lớp không) ---
        requirement(c1, webCat, "Xây dựng ứng dụng web hoàn chỉnh: BE + FE, CRUD, phân quyền.", today.plusMonths(2),
                "Phân tích & thiết kế", 3, "Cài đặt chức năng", 4, "Báo cáo & demo", 3);
        requirement(c2, webCat, "Thiết kế CSDL chuẩn hóa và truy vấn nâng cao.", today.plusMonths(2),
                "Mô hình ERD", 4, "Chuẩn hóa", 3, "Truy vấn", 3);
        requirement(c3, aiCat, "Bài toán AI: thu thập dữ liệu, huấn luyện, đánh giá.", today.minusWeeks(1),
                "Dữ liệu", 3, "Mô hình", 4, "Đánh giá", 3);
        requirement(c5, webCat, "Đồ án môn học theo nhóm, nộp đúng hạn.", today.plusMonths(2),
                "Tiến độ", 5, "Chất lượng", 5);
        // c4, c6: không thiết lập yêu cầu

        // --- Nhóm (ACTIVE + INVITED + PENDING; có nhóm / chưa nhóm) ---
        Group gAlpha = group("Nhóm Alpha", "Nhóm chăm chỉ nhất lớp.", c1, s.get(0));
        member(gAlpha, s.get(1), GroupMemberStatus.ACTIVE, false);
        member(gAlpha, s.get(2), GroupMemberStatus.ACTIVE, false);
        member(gAlpha, s.get(3), GroupMemberStatus.INVITED, false); // được mời, chờ chấp nhận
        member(gAlpha, s.get(4), GroupMemberStatus.PENDING, false); // xin vào, chờ leader duyệt

        Group gBeta = group("Nhóm Beta", "Đội hình trẻ.", c1, s.get(5));
        member(gBeta, s.get(6), GroupMemberStatus.ACTIVE, false);
        member(gBeta, s.get(7), GroupMemberStatus.ACTIVE, false);

        Group gGamma = group("Nhóm Gamma", "Chuyên gia CSDL.", c2, s.get(8));
        member(gGamma, s.get(9), GroupMemberStatus.ACTIVE, false);
        member(gGamma, s.get(10), GroupMemberStatus.ACTIVE, false);

        Group gDelta = group("Nhóm Delta", "Đội AI.", c3, s.get(11));
        member(gDelta, s.get(12), GroupMemberStatus.ACTIVE, false);
        member(gDelta, s.get(13), GroupMemberStatus.ACTIVE, false);

        Group gEpsilon = group("Nhóm Epsilon", "Nhóm Đồ án 1.", c5, s.get(14));
        member(gEpsilon, s.get(15), GroupMemberStatus.ACTIVE, false);
        // s.get(16..18) trong c5 nhưng chưa có nhóm (free → mời được)

        // --- Đồ án + đăng ký (APPROVED / PENDING / AVAILABLE / quá hạn) ---
        Project pAlpha = project("Website quản lý thư viện", "Hệ thống mượn/trả sách, quản lý độc giả.", c1, webCat,
                ProjectStatus.IN_PROGRESS, today.minusWeeks(2), today.plusMonths(2));
        registration(pAlpha, gAlpha, RegistrationStatus.APPROVED, LocalDateTime.now().minusWeeks(2), "Đề tài tốt, triển khai như kế hoạch.");

        Project pBeta = project("Hệ thống đặt phòng khách sạn", "Đặt phòng trực tuyến, thanh toán.", c1, webCat,
                ProjectStatus.PENDING, today, today.plusMonths(2));
        registration(pBeta, gBeta, RegistrationStatus.PENDING, LocalDateTime.now().minusDays(2), null);

        Project pGamma = project("App quản lý chi tiêu cá nhân", "Theo dõi thu chi, báo cáo theo tháng.", c2, webCat,
                ProjectStatus.IN_PROGRESS, today.minusWeeks(3), today.plusMonths(2));
        registration(pGamma, gGamma, RegistrationStatus.APPROVED, LocalDateTime.now().minusWeeks(3), null);

        Project pDelta = project("Nhận diện khuôn mặt điểm danh", "Dùng CNN nhận diện sinh viên.", c3, aiCat,
                ProjectStatus.IN_PROGRESS, today.minusMonths(2), today.minusWeeks(1)); // quá hạn
        registration(pDelta, gDelta, RegistrationStatus.APPROVED, LocalDateTime.now().minusMonths(2), null);

        Project pEpsilon = project("Game 2D Platformer Unity", "Game đi cảnh 2D.", c5, webCat,
                ProjectStatus.IN_PROGRESS, today.minusWeeks(2), today.plusMonths(2));
        registration(pEpsilon, gEpsilon, RegistrationStatus.APPROVED, LocalDateTime.now().minusWeeks(2), null);

        // Đề tài GV tạo sẵn, chưa nhóm nào nhận.
        project("Đề tài mở: Chatbot tư vấn tuyển sinh", "Chưa nhóm nào đăng ký.", c4, null,
                ProjectStatus.AVAILABLE, today, today.plusMonths(3));

        // --- Nộp bài (đã nộp / nộp trễ / đã chấm / chưa nộp) ---
        submission(pAlpha, gAlpha, SubmissionStatus.SUBMITTED, s.get(0), LocalDateTime.now().minusDays(3),
                "/files/submissions/demo/baocao_alpha.pdf");
        Submission subGamma = submission(pGamma, gGamma, SubmissionStatus.GRADED, s.get(8), LocalDateTime.now().minusWeeks(1),
                "/files/submissions/demo/baocao_gamma.pdf");
        Submission subDelta = submission(pDelta, gDelta, SubmissionStatus.LATE, s.get(11), LocalDateTime.now().minusDays(2),
                "/files/submissions/demo/baocao_delta.pdf");
        // pEpsilon: chưa nộp bài

        // --- Điểm (đã chấm có nhận xét / nộp rồi nhưng chưa chấm) ---
        grade(subGamma, 8, 10, "Làm tốt, UI đẹp. Cần bổ sung unit test.", t.get(1),
                new String[] { "Mô hình ERD", "Chuẩn hóa", "Truy vấn" }, new int[] { 3, 3, 2 }, new int[] { 4, 3, 3 });
        grade(subDelta, 6, 10, "Nộp trễ, độ chính xác mô hình chưa cao.", t.get(2),
                new String[] { "Dữ liệu", "Mô hình", "Đánh giá" }, new int[] { 2, 2, 2 }, new int[] { 3, 4, 3 });
        // subAlpha: đã nộp nhưng chưa chấm

        // --- Task (đủ TODO/IN_PROGRESS/REVIEW/DONE/BLOCKED) ---
        task(pAlpha, gAlpha, "Thiết kế cơ sở dữ liệu", "ERD + script khởi tạo.", TaskStatus.DONE, s.get(1), s.get(0));
        task(pAlpha, gAlpha, "Cài đặt API mượn/trả", "REST API Spring Boot.", TaskStatus.IN_PROGRESS, s.get(2), s.get(0));
        task(pAlpha, gAlpha, "Giao diện danh sách sách", "React + Tailwind.", TaskStatus.REVIEW, s.get(1), s.get(0));
        task(pAlpha, gAlpha, "Viết báo cáo cuối kỳ", "Tổng hợp tài liệu.", TaskStatus.TODO, s.get(0), s.get(0));
        task(pAlpha, gAlpha, "Sửa lỗi đăng nhập JWT", "Bị chặn do thiếu refresh token.", TaskStatus.BLOCKED, s.get(2), s.get(0));
        task(pGamma, gGamma, "Tích hợp biểu đồ chi tiêu", "Chart.js.", TaskStatus.DONE, s.get(9), s.get(8));
        task(pGamma, gGamma, "Viết unit test service", "JUnit + Mockito.", TaskStatus.TODO, s.get(10), s.get(8));

        // --- Thông báo (duyệt / từ chối kèm nhận xét; đã đọc / chưa đọc) ---
        notify(s.get(0), "APPROVED", "đã duyệt đề tài \"Website quản lý thư viện\"",
                "Đề tài tốt, triển khai như kế hoạch.", c1.getId(), pAlpha.getId(), false);
        notify(s.get(5), "REJECTED", "đã từ chối đề tài \"Mạng xã hội chia sẻ ảnh\"",
                "Đề tài trùng với nhóm khác, hãy đề xuất hướng mới.", c1.getId(), null, false);
        notify(s.get(8), "APPROVED", "đã duyệt đề tài \"App quản lý chi tiêu cá nhân\"",
                null, c2.getId(), pGamma.getId(), true);

        System.out.println("Đã seed dữ liệu demo: 5 GV (gv1..gv5@uit.edu.vn), 20 SV (sv1..sv20@uit.edu.vn), mật khẩu 123123.");
    }

    private Category cat(String name) {
        return categoryRepository.findAll().stream()
                .filter(c -> name.equals(c.getName())).findFirst().orElse(null);
    }

    private Course course(String code, String name, User lecturer, LocalDate start, LocalDate end) {
        return courseRepository.save(Course.builder()
                .code(code).name(name).lecturer(lecturer).maxStudents(40).startDate(start).endDate(end).build());
    }

    private void enroll(User student, Course course, JoinStatus status) {
        courseRequestRepository.save(CourseRequest.builder()
                .course(course).student(student).status(status).requestAt(LocalDateTime.now()).build());
    }

    private void requirement(Course course, Category category, String desc, LocalDate deadline, Object... critPairs) {
        Requirement r = Requirement.builder().course(course).category(category).description(desc).deadline(deadline).build();
        int order = 0;
        for (int i = 0; i + 1 < critPairs.length; i += 2) {
            r.getCriteria().add(RubricCriterion.builder()
                    .requirement(r).name((String) critPairs[i]).maxScore((Integer) critPairs[i + 1]).orderIndex(order++).build());
        }
        requirementRepository.save(r);
    }

    private Group group(String name, String desc, Course course, User leader) {
        Group g = groupRepository.save(Group.builder().name(name).description(desc).course(course).leader(leader).build());
        member(g, leader, GroupMemberStatus.ACTIVE, true);
        return g;
    }

    private void member(Group group, User user, GroupMemberStatus status, boolean isLeader) {
        GroupMember m = new GroupMember();
        m.setGroup(group);
        m.setUser(user);
        m.setStatus(status);
        m.setIsLeader(isLeader);
        m.setJoinedDate(LocalDate.now());
        m.setCreatedAt(LocalDateTime.now());
        groupMemberRepository.save(m);
    }

    private Project project(String title, String desc, Course course, Category category, ProjectStatus status,
            LocalDate start, LocalDate end) {
        return projectRepository.save(Project.builder()
                .title(title).description(desc).course(course).category(category).status(status)
                .startDate(start).endDate(end).submissionLocked(false).build());
    }

    private void registration(Project project, Group group, RegistrationStatus status, LocalDateTime registeredAt, String note) {
        registrationRepository.save(Registration.builder()
                .project(project).group(group).status(status).registeredAt(registeredAt)
                .approvedAt(status == RegistrationStatus.APPROVED ? registeredAt.plusDays(1) : null)
                .note(note).build());
    }

    private Submission submission(Project project, Group group, SubmissionStatus status, User submittedBy,
            LocalDateTime submittedAt, String filePath) {
        return submissionRepository.save(Submission.builder()
                .project(project).group(group).status(status).submittedBy(submittedBy)
                .submittedAt(submittedAt).filePath(filePath).build());
    }

    private void grade(Submission submission, int score, int maxScore, String feedback, User gradedBy,
            String[] names, int[] scores, int[] maxScores) {
        Grade g = Grade.builder().submission(submission).score(score).maxScore(maxScore).feedback(feedback)
                .gradedBy(gradedBy).gradedAt(LocalDateTime.now()).build();
        for (int i = 0; i < names.length; i++) {
            g.getCriterionScores().add(GradeCriterionScore.builder()
                    .grade(g).criterionName(names[i]).score(scores[i]).maxScore(maxScores[i]).build());
        }
        gradeRepository.save(g);
    }

    private void task(Project project, Group group, String title, String desc, TaskStatus status,
            User assignedTo, User createdBy) {
        taskRepository.save(Task.builder()
                .title(title).description(desc).status(status).assignedTo(assignedTo).createdBy(createdBy)
                .group(group).project(project).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build());
    }

    private void notify(User recipient, String type, String title, String message, Long courseId, Long projectId, boolean read) {
        notificationRepository.save(Notification.builder()
                .recipient(recipient).type(type).title(title).message(message)
                .courseId(courseId).projectId(projectId).isRead(read).createdAt(LocalDateTime.now()).build());
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
            try {
                jdbc.execute("ALTER TABLE `" + table + "` MODIFY COLUMN status VARCHAR(30)");
            } catch (Exception ignored) {
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
