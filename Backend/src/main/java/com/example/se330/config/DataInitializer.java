package com.example.se330.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.se330.entity.Category;
import com.example.se330.entity.Course;
import com.example.se330.entity.CourseRequest;
import com.example.se330.entity.Grade;
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

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private static final String DEMO_COURSE_CODE = "SE330A";
    // Các lớp demo được làm mới mỗi lần khởi động (KHÔNG đụng lớp thật khác trong DB).
    private static final List<String> DEMO_COURSE_CODES = List.of(
            "SE330A", "SE347B", "IT008C", "CS232D");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final CourseRequestRepository courseRequestRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final RequirementRepository requirementRepository;
    private final RegistrationRepository registrationRepository;
    private final SubmissionRepository submissionRepository;
    private final NotificationRepository notificationRepository;
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
        ensureUser("admin@gmail.com", "Admin", Role.ADMIN);
        User teacher = ensureUser("teacher@gmail.com", "Teacher", Role.TEACHER);
        User studentA = ensureUser("student@gmail.com", "Student", Role.STUDENT);

        seedCategory("Web App", "Ứng dụng web, API và quản lý dữ liệu");
        seedCategory("Research", "Đề tài nghiên cứu");
        seedCategory("Capstone", "Đồ án tốt nghiệp");
        seedCategory("UI/UX Design", "Thiết kế trải nghiệm người dùng");
        seedCategory("Paper", "Bài báo khoa học");

        // Các cột status từng được Hibernate tạo dạng MySQL ENUM với tập giá trị cũ;
        // ddl-auto=update không thêm giá trị enum mới (REVIEW/INVITED/PENDING) → đổi
        // sang VARCHAR để nhận mọi giá trị (an toàn, giữ nguyên dữ liệu).
        widenStatusColumns();

        // Các lớp demo được làm mới mỗi lần khởi động để luôn đủ data test
        // (KHÔNG đụng các lớp thật khác trong DB).
        DEMO_COURSE_CODES.forEach(this::wipeDemoCourse);
        seedDemo(teacher, studentA);

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

    private void wipeDemoCourse(String courseCode) {
        Long cid = courseRepository.findByCode(courseCode).map(Course::getId).orElse(null);
        if (cid == null) {
            return;
        }
        // Xóa theo thứ tự FK-safe (con trước, cha sau).
        jdbc.update("DELETE FROM grades WHERE submission_id IN "
                + "(SELECT submission_id FROM submissions WHERE project_id IN "
                + "(SELECT project_id FROM projects WHERE course_id=?))", cid);
        jdbc.update("DELETE FROM tasks WHERE project_id IN (SELECT project_id FROM projects WHERE course_id=?) "
                + "OR group_id IN (SELECT group_id FROM `groups` WHERE course_id=?)", cid, cid);
        jdbc.update("DELETE FROM submissions WHERE project_id IN (SELECT project_id FROM projects WHERE course_id=?)", cid);
        jdbc.update("DELETE FROM registrations WHERE project_id IN (SELECT project_id FROM projects WHERE course_id=?)", cid);
        jdbc.update("DELETE FROM group_members WHERE group_id IN (SELECT group_id FROM `groups` WHERE course_id=?)", cid);
        jdbc.update("DELETE FROM rubric_criteria WHERE requirement_id IN "
                + "(SELECT requirement_id FROM requirements WHERE course_id=?)", cid);
        jdbc.update("DELETE FROM requirements WHERE course_id=?", cid);
        jdbc.update("DELETE FROM `groups` WHERE course_id=?", cid);
        jdbc.update("DELETE FROM projects WHERE course_id=?", cid);
        jdbc.update("DELETE FROM course_requests WHERE course_id=?", cid);
        jdbc.update("DELETE FROM courses WHERE course_id=?", cid);
    }

    private void seedDemo(User teacher, User studentA) {
        List<Category> cats = categoryRepository.findByIsActiveTrue();
        Category webCat = cats.isEmpty() ? null : cats.get(0);
        Category researchCat = cats.size() > 1 ? cats.get(1) : webCat;
        Category capstoneCat = cats.size() > 2 ? cats.get(2) : webCat;
        Category uiuxCat = cats.size() > 3 ? cats.get(3) : webCat;

        // --- Sinh viên (mật khẩu 123123) ---
        User b = ensureUser("student2@gmail.com", "Trần Văn B", Role.STUDENT);
        User c = ensureUser("student3@gmail.com", "Lê Thị C", Role.STUDENT);
        User d = ensureUser("student4@gmail.com", "Phạm Văn D", Role.STUDENT);
        User e = ensureUser("student5@gmail.com", "Hoàng Thị E", Role.STUDENT);
        User f = ensureUser("student6@gmail.com", "Vũ Văn F", Role.STUDENT);
        User g = ensureUser("student7@gmail.com", "Đặng Văn G", Role.STUDENT);
        User h = ensureUser("student8@gmail.com", "Bùi Thị H", Role.STUDENT);
        User i = ensureUser("student9@gmail.com", "Đỗ Văn I", Role.STUDENT);
        User j = ensureUser("student10@gmail.com", "Ngô Thị K", Role.STUDENT);
        User k = ensureUser("student11@gmail.com", "Dương Văn L", Role.STUDENT);
        User l = ensureUser("student12@gmail.com", "Lý Thị M", Role.STUDENT);
        User m = ensureUser("student13@gmail.com", "Phan Văn N", Role.STUDENT);
        User n = ensureUser("student14@gmail.com", "Võ Thị O", Role.STUDENT);
        User o = ensureUser("student15@gmail.com", "Trương Văn P", Role.STUDENT);
        User p = ensureUser("student16@gmail.com", "Huỳnh Thị Q", Role.STUDENT);

        Course course = new Course();
        course.setName("SE330 - Công nghệ phần mềm");
        course.setCode(DEMO_COURSE_CODE);
        course.setLecturer(teacher);
        course.setMaxStudents(60);
        course.setStartDate(LocalDate.now().minusDays(30));
        course.setEndDate(LocalDate.now().plusDays(90));
        course = courseRepository.save(course);

        // Đa số SV đã vào lớp (ACTIVE)...
        for (User s : List.of(studentA, b, c, d, e, f, g, h, i, j, k, l)) {
            enroll(course, s);
        }
        // ...một số trạng thái khác để test duyệt/khóa lớp.
        courseRequest(course, m, JoinStatus.PENDING);     // chờ GV duyệt vào lớp
        courseRequest(course, n, JoinStatus.PENDING);
        courseRequest(course, o, JoinStatus.REJECTED);    // bị từ chối
        courseRequest(course, p, JoinStatus.SUSPENDED);   // bị tạm khóa

        // --- Nhóm Phoenix: A trưởng nhóm, B chính thức; C xin vào (PENDING), D được mời (INVITED) ---
        Group phoenix = groupRepository.save(Group.builder()
                .name("Nhóm Phoenix").description("Nhóm đã có đồ án — đủ task/bài nộp để test")
                .course(course).leader(studentA).build());
        member(phoenix, studentA, GroupMemberStatus.ACTIVE, true);
        member(phoenix, b, GroupMemberStatus.ACTIVE, false);
        member(phoenix, c, GroupMemberStatus.PENDING, false);   // yêu cầu xin vào (leader duyệt)
        member(phoenix, d, GroupMemberStatus.INVITED, false);   // lời mời (D chấp nhận/từ chối)

        Project p1 = project(course, webCat, "Website quản lý đồ án môn SE330",
                "Hệ thống quản lý đề tài, nhóm sinh viên, task và tiến độ nộp bài.",
                ProjectStatus.IN_PROGRESS, -20, 40);
        register(p1, phoenix, RegistrationStatus.APPROVED, 20, "Nhóm Phoenix nhận đề tài.");

        task(p1, phoenix, studentA, "Thiết kế cơ sở dữ liệu", TaskStatus.DONE, -2);
        task(p1, phoenix, studentA, "Xây dựng API backend", TaskStatus.IN_PROGRESS, 7);
        task(p1, phoenix, b, "Thiết kế giao diện Figma", TaskStatus.REVIEW, 3);
        task(p1, phoenix, b, "Viết tài liệu SRS", TaskStatus.TODO, 14);
        task(p1, phoenix, studentA, "Tích hợp cổng thanh toán", TaskStatus.BLOCKED, -1); // quá hạn, bị chặn

        submissionRepository.save(Submission.builder()
                .project(p1).group(phoenix).status(SubmissionStatus.SUBMITTED)
                .filePath("/submissions/phoenix/srs-v1.pdf").submittedAt(LocalDateTime.now().minusDays(5)).build());
        submissionRepository.save(Submission.builder()
                .project(p1).group(phoenix).status(SubmissionStatus.LATE)
                .filePath("/submissions/phoenix/sprint1-late.zip").submittedAt(LocalDateTime.now().minusDays(2)).build());

        // --- Nhóm Aster: E trưởng nhóm, đề xuất đề tài đang CHỜ DUYỆT (cho GV duyệt/từ chối) ---
        Group aster = groupRepository.save(Group.builder()
                .name("Nhóm Aster").description("Nhóm có đề xuất đề tài đang chờ giảng viên duyệt")
                .course(course).leader(e).build());
        member(aster, e, GroupMemberStatus.ACTIVE, true);
        member(aster, f, GroupMemberStatus.ACTIVE, false);

        Project p2 = project(course, webCat, "Ứng dụng điểm danh lớp học bằng QR",
                "Tạo phiên điểm danh, sinh viên quét mã QR và theo dõi lịch sử tham gia.",
                ProjectStatus.PENDING, 0, 0);
        register(p2, aster, RegistrationStatus.PENDING, 1, "Nhóm Aster đề xuất đề tài QR.");

        // --- Nhóm Nova: đồ án ĐÃ HOÀN THÀNH, có bài nộp ĐÃ CHẤM điểm ---
        Group nova = groupRepository.save(Group.builder()
                .name("Nhóm Nova").description("Nhóm đã hoàn thành đồ án và được chấm điểm")
                .course(course).leader(g).build());
        member(nova, g, GroupMemberStatus.ACTIVE, true);
        member(nova, h, GroupMemberStatus.ACTIVE, false);
        member(nova, i, GroupMemberStatus.ACTIVE, false);

        Project p3 = project(course, researchCat, "Hệ thống gợi ý đề tài bằng Machine Learning",
                "Phân tích hồ sơ sinh viên để gợi ý đề tài phù hợp dựa trên kỹ năng và sở thích.",
                ProjectStatus.COMPLETED, -60, -5);
        register(p3, nova, RegistrationStatus.APPROVED, 55, "Nhóm Nova nhận đề tài ML.");
        task(p3, nova, g, "Thu thập & làm sạch dữ liệu", TaskStatus.DONE, -30);
        task(p3, nova, h, "Huấn luyện mô hình", TaskStatus.DONE, -15);
        task(p3, nova, i, "Đánh giá & viết báo cáo", TaskStatus.DONE, -6);
        gradedSubmission(p3, nova, "/submissions/nova/final-report.pdf", 6, 88, teacher,
                "Mô hình tốt, báo cáo rõ ràng. Cần bổ sung kiểm thử trên tập dữ liệu lớn hơn.");

        // --- Nhóm Titan: đồ án ĐÃ PHÂN CÔNG (ALLOCATED), đang làm dở ---
        Group titan = groupRepository.save(Group.builder()
                .name("Nhóm Titan").description("Nhóm vừa được phân đề tài, đang triển khai")
                .course(course).leader(j).build());
        member(titan, j, GroupMemberStatus.ACTIVE, true);
        member(titan, k, GroupMemberStatus.ACTIVE, false);
        member(titan, l, GroupMemberStatus.ACTIVE, false);

        Project p4 = project(course, uiuxCat, "App đặt lịch phòng học & thiết bị",
                "Quản lý đặt phòng, mượn thiết bị và lịch sử sử dụng cho khoa CNPM.",
                ProjectStatus.ALLOCATED, -7, 50);
        register(p4, titan, RegistrationStatus.APPROVED, 7, "Nhóm Titan nhận đề tài đặt lịch.");
        task(p4, titan, j, "Khảo sát yêu cầu người dùng", TaskStatus.DONE, -1);
        task(p4, titan, k, "Wireframe & prototype", TaskStatus.IN_PROGRESS, 5);
        task(p4, titan, l, "Thiết lập CI/CD", TaskStatus.TODO, 12);

        // --- Đề tài MỞ (AVAILABLE) chưa nhóm nào nhận; có đăng ký bị từ chối/hủy để test ---
        Project p5 = project(course, capstoneCat, "Nền tảng chấm bài tự động cho lập trình",
                "Sinh viên nộp code, hệ thống chạy test case và chấm điểm tự động.",
                ProjectStatus.AVAILABLE, 3, 70);
        register(p5, phoenix, RegistrationStatus.REJECTED, 4, "Phoenix đã có đề tài khác — từ chối.");
        register(p5, titan, RegistrationStatus.CANCELLED, 3, "Titan rút đăng ký.");

        // --- Đề tài ĐÃ HỦY (CANCELLED) ---
        project(course, webCat, "Diễn đàn hỏi đáp môn học (đã hủy)",
                "Đề tài bị hủy do trùng với hệ thống LMS hiện có.",
                ProjectStatus.CANCELLED, -10, 30);

        // --- Yêu cầu đồ án + barem chấm điểm ---
        // Lưu ý: Requirement là OneToOne với Course (course_id unique) → mỗi lớp chỉ có 1 yêu cầu.
        requirement(course, webCat, "Xây dựng ứng dụng web quản lý đồ án; nộp báo cáo và mã nguồn.", 40,
                new String[] { "Thiết kế & kiến trúc", "Chức năng hoàn thiện",
                        "Giao diện UI/UX", "Báo cáo & thuyết trình" });

        // --- Thông báo demo cho chuông Navbar (student@gmail & teacher@gmail) ---
        seedNotifications(studentA, teacher, course, p1, p2, p3);

        // --- Các lớp học khác (cùng giảng viên) cho dashboard & danh sách lớp phong phú ---
        seedWebCourse(teacher, studentA, b, c, d, e, f, g, h, webCat, uiuxCat, researchCat);
        seedVisualCourse(teacher, studentA, i, j, k, l, m, capstoneCat, uiuxCat, webCat);
        seedNetworkCourse(teacher, studentA, g, h, n, o, p, researchCat, webCat, capstoneCat);

        System.out.println("Seeded demo: 4 lớp (SE330A/SE347B/IT008C/CS232D) cùng GV teacher@gmail, "
                + "student@gmail là thành viên active ở cả 4 lớp; nhiều nhóm/đồ án đủ trạng thái, "
                + "task trải nhiều tháng, bài nộp chờ chấm + đã chấm điểm, yêu cầu+barem mỗi lớp.");
    }

    // ===== SE347B — Phát triển ứng dụng Web (student@gmail là thành viên nhóm Hydra) =====
    private void seedWebCourse(User teacher, User studentA, User b, User c, User d, User e,
            User f, User g, User h, Category webCat, Category uiuxCat, Category researchCat) {
        Course course = course("SE347 - Phát triển ứng dụng Web", "SE347B", teacher, -50, 70, 50);
        for (User s : List.of(studentA, b, c, d, e, f, g, h)) {
            enroll(course, s);
        }

        // Nhóm Hydra: b làm trưởng, student@gmail là thành viên chính thức.
        Group hydra = groupRepository.save(Group.builder()
                .name("Nhóm Hydra").description("Phát triển nền tảng thương mại điện tử mini")
                .course(course).leader(b).build());
        member(hydra, b, GroupMemberStatus.ACTIVE, true);
        member(hydra, studentA, GroupMemberStatus.ACTIVE, false);
        member(hydra, c, GroupMemberStatus.ACTIVE, false);

        Project hp = project(course, webCat, "Sàn thương mại điện tử cho đặc sản vùng miền",
                "Quản lý gian hàng, giỏ hàng, thanh toán và đánh giá sản phẩm.",
                ProjectStatus.IN_PROGRESS, -40, 30);
        register(hp, hydra, RegistrationStatus.APPROVED, 38, "Nhóm Hydra nhận đề tài TMĐT.");
        task(hp, hydra, b, "Phân tích nghiệp vụ & ERD", TaskStatus.DONE, -25, 45, 40);
        task(hp, hydra, studentA, "Xây dựng API sản phẩm & giỏ hàng", TaskStatus.DONE, -10, 35, 8);
        task(hp, hydra, studentA, "Tích hợp thanh toán VNPay", TaskStatus.IN_PROGRESS, 6, 18, 1);
        task(hp, hydra, c, "Trang quản trị gian hàng", TaskStatus.REVIEW, 4, 12, 2);
        task(hp, hydra, studentA, "Viết kiểm thử đơn vị cho module đơn hàng", TaskStatus.TODO, 12, 5, null);
        submission(hp, hydra, SubmissionStatus.SUBMITTED, "/submissions/hydra/sprint2.zip", 4); // chờ chấm
        submission(hp, hydra, SubmissionStatus.LATE, "/submissions/hydra/sprint1-late.zip", 20);

        // Nhóm Vega: đồ án đã hoàn thành & chấm điểm.
        Group vega = groupRepository.save(Group.builder()
                .name("Nhóm Vega").description("Ứng dụng quản lý thư viện số")
                .course(course).leader(d).build());
        member(vega, d, GroupMemberStatus.ACTIVE, true);
        member(vega, e, GroupMemberStatus.ACTIVE, false);
        Project vp = project(course, webCat, "Thư viện số mượn/trả sách trực tuyến",
                "Tra cứu, đặt mượn, gia hạn và thống kê lượt mượn theo thể loại.",
                ProjectStatus.COMPLETED, -45, -3);
        register(vp, vega, RegistrationStatus.APPROVED, 42, "Nhóm Vega nhận đề tài thư viện số.");
        task(vp, vega, d, "Thiết kế CSDL & API", TaskStatus.DONE, -30, 44, 30);
        task(vp, vega, e, "Giao diện người dùng", TaskStatus.DONE, -12, 30, 12);
        gradedSubmission(vp, vega, "/submissions/vega/final.pdf", 4, 91, teacher,
                "Sản phẩm hoàn thiện, UI tốt. Nên bổ sung phân quyền chi tiết hơn.");

        // Nhóm Orion: vừa được phân đề tài, đang làm.
        Group orion = groupRepository.save(Group.builder()
                .name("Nhóm Orion").description("Hệ thống đặt vé sự kiện")
                .course(course).leader(f).build());
        member(orion, f, GroupMemberStatus.ACTIVE, true);
        member(orion, g, GroupMemberStatus.ACTIVE, false);
        member(orion, h, GroupMemberStatus.ACTIVE, false);
        Project op = project(course, uiuxCat, "Ứng dụng đặt vé sự kiện & check-in QR",
                "Tạo sự kiện, bán vé, sinh mã QR và check-in tại cổng.",
                ProjectStatus.ALLOCATED, -8, 55);
        register(op, orion, RegistrationStatus.APPROVED, 7, "Nhóm Orion nhận đề tài đặt vé.");
        task(op, orion, f, "Khảo sát & wireframe", TaskStatus.DONE, -2, 8, 2);
        task(op, orion, g, "Module bán vé", TaskStatus.IN_PROGRESS, 9, 6, 1);
        task(op, orion, h, "Thiết lập hạ tầng & CI", TaskStatus.TODO, 16, 3, null);

        // Đề tài MỞ + đề xuất đang chờ GV duyệt (cho feed/đếm của GV).
        Project free = project(course, researchCat, "Trợ lý gợi ý lộ trình học bằng AI",
                "Phân tích kết quả học tập, gợi ý môn học và tài nguyên phù hợp.",
                ProjectStatus.AVAILABLE, 2, 75);
        register(free, orion, RegistrationStatus.PENDING, 2, "Nhóm Orion đề xuất thêm đề tài AI.");

        requirement(course, webCat, "Xây dựng ứng dụng web hoàn chỉnh có frontend + backend + CSDL.", 35,
                new String[] { "Kiến trúc & API", "Tính năng & nghiệp vụ",
                        "Giao diện & trải nghiệm", "Bảo mật & kiểm thử", "Báo cáo" });
    }

    // ===== IT008C — Lập trình trực quan (student@gmail làm trưởng nhóm Lyra) =====
    private void seedVisualCourse(User teacher, User studentA, User i, User j, User k, User l,
            User m, Category capstoneCat, Category uiuxCat, Category webCat) {
        Course course = course("IT008 - Lập trình trực quan", "IT008C", teacher, -35, 80, 45);
        for (User s : List.of(studentA, i, j, k, l)) {
            enroll(course, s);
        }
        courseRequest(course, m, JoinStatus.PENDING); // chờ GV duyệt vào lớp

        // Nhóm Lyra: student@gmail làm trưởng nhóm.
        Group lyra = groupRepository.save(Group.builder()
                .name("Nhóm Lyra").description("Phần mềm quản lý quán cà phê trên desktop")
                .course(course).leader(studentA).build());
        member(lyra, studentA, GroupMemberStatus.ACTIVE, true);
        member(lyra, i, GroupMemberStatus.ACTIVE, false);
        member(lyra, j, GroupMemberStatus.ACTIVE, false);
        Project lp = project(course, uiuxCat, "Phần mềm quản lý quán cà phê (WinForms)",
                "Quản lý thực đơn, gọi món theo bàn, in hóa đơn và báo cáo doanh thu.",
                ProjectStatus.IN_PROGRESS, -28, 13); // sắp đến hạn nộp
        register(lp, lyra, RegistrationStatus.APPROVED, 26, "Nhóm Lyra nhận đề tài quản lý quán.");
        task(lp, lyra, studentA, "Thiết kế giao diện gọi món theo bàn", TaskStatus.DONE, -15, 28, 14);
        task(lp, lyra, i, "Module kho & nguyên liệu", TaskStatus.DONE, -6, 20, 6);
        task(lp, lyra, studentA, "Báo cáo doanh thu theo ngày/tháng", TaskStatus.IN_PROGRESS, 5, 10, 1);
        task(lp, lyra, j, "Chức năng in hóa đơn", TaskStatus.REVIEW, 3, 8, 2);
        task(lp, lyra, studentA, "Đóng gói & viết hướng dẫn cài đặt", TaskStatus.TODO, 14, 4, null);
        submission(lp, lyra, SubmissionStatus.SUBMITTED, "/submissions/lyra/demo-v1.zip", 3); // chờ chấm

        // Nhóm Draco: hoàn thành & đã chấm điểm.
        Group draco = groupRepository.save(Group.builder()
                .name("Nhóm Draco").description("Ứng dụng quản lý phòng gym")
                .course(course).leader(k).build());
        member(draco, k, GroupMemberStatus.ACTIVE, true);
        member(draco, l, GroupMemberStatus.ACTIVE, false);
        Project dp = project(course, capstoneCat, "Quản lý hội viên & lịch tập phòng gym",
                "Đăng ký gói tập, nhắc gia hạn, xếp lịch huấn luyện viên.",
                ProjectStatus.COMPLETED, -30, -2);
        register(dp, draco, RegistrationStatus.APPROVED, 28, "Nhóm Draco nhận đề tài phòng gym.");
        task(dp, draco, k, "Quản lý gói tập & thanh toán", TaskStatus.DONE, -18, 30, 18);
        task(dp, draco, l, "Lịch & thông báo nhắc hạn", TaskStatus.DONE, -8, 22, 8);
        gradedSubmission(dp, draco, "/submissions/draco/final.pdf", 3, 85, teacher,
                "Chức năng đầy đủ. Giao diện cần đồng bộ màu sắc và khoảng cách tốt hơn.");

        // Đề tài mở chưa nhóm nào nhận.
        project(course, webCat, "Công cụ vẽ sơ đồ tư duy kéo-thả",
                "Tạo, kéo-thả node, kết nối và xuất ảnh sơ đồ tư duy.",
                ProjectStatus.AVAILABLE, 3, 60);

        requirement(course, uiuxCat, "Xây dựng ứng dụng desktop có giao diện trực quan, thao tác mượt.", 30,
                new String[] { "Giao diện trực quan", "Chức năng nghiệp vụ",
                        "Xử lý dữ liệu", "Báo cáo & demo" });
    }

    // ===== CS232D — Lập trình mạng (student@gmail là thành viên nhóm Sirius) =====
    private void seedNetworkCourse(User teacher, User studentA, User g, User h, User n, User o,
            User p, Category researchCat, Category webCat, Category capstoneCat) {
        Course course = course("CS232 - Lập trình mạng", "CS232D", teacher, -20, 95, 40);
        for (User s : List.of(studentA, g, h, n, o)) {
            enroll(course, s);
        }
        courseRequest(course, p, JoinStatus.PENDING);

        // Nhóm Sirius: g làm trưởng, student@gmail là thành viên.
        Group sirius = groupRepository.save(Group.builder()
                .name("Nhóm Sirius").description("Ứng dụng chat thời gian thực")
                .course(course).leader(g).build());
        member(sirius, g, GroupMemberStatus.ACTIVE, true);
        member(sirius, studentA, GroupMemberStatus.ACTIVE, false);
        member(sirius, h, GroupMemberStatus.ACTIVE, false);
        Project sp = project(course, webCat, "Ứng dụng chat realtime đa phòng (WebSocket)",
                "Nhắn tin nhóm, phòng riêng, trạng thái online và lịch sử hội thoại.",
                ProjectStatus.IN_PROGRESS, -15, 10); // sắp đến hạn nộp
        register(sp, sirius, RegistrationStatus.APPROVED, 13, "Nhóm Sirius nhận đề tài chat.");
        task(sp, sirius, g, "Thiết lập máy chủ WebSocket", TaskStatus.DONE, -8, 15, 8);
        task(sp, sirius, studentA, "Giao diện phòng chat & danh bạ", TaskStatus.IN_PROGRESS, 7, 9, 1);
        task(sp, sirius, studentA, "Mã hóa & xác thực kết nối", TaskStatus.TODO, 18, 3, null);
        task(sp, sirius, h, "Lưu lịch sử hội thoại", TaskStatus.BLOCKED, -1, 6, 1); // chờ thiết kế CSDL
        submission(sp, sirius, SubmissionStatus.SUBMITTED, "/submissions/sirius/milestone1.zip", 2); // chờ chấm

        // Nhóm Atlas: hoàn thành & đã chấm.
        Group atlas = groupRepository.save(Group.builder()
                .name("Nhóm Atlas").description("Công cụ truyền file ngang hàng (P2P)")
                .course(course).leader(n).build());
        member(atlas, n, GroupMemberStatus.ACTIVE, true);
        member(atlas, o, GroupMemberStatus.ACTIVE, false);
        Project ap = project(course, capstoneCat, "Công cụ truyền file P2P có mã hóa",
                "Chia nhỏ file, truyền ngang hàng, kiểm tra toàn vẹn và mã hóa đầu cuối.",
                ProjectStatus.COMPLETED, -18, -1);
        register(ap, atlas, RegistrationStatus.APPROVED, 16, "Nhóm Atlas nhận đề tài P2P.");
        task(ap, atlas, n, "Giao thức truyền & chia khối", TaskStatus.DONE, -10, 18, 10);
        task(ap, atlas, o, "Mã hóa & kiểm tra toàn vẹn", TaskStatus.DONE, -4, 12, 4);
        gradedSubmission(ap, atlas, "/submissions/atlas/final.pdf", 2, 93, teacher,
                "Giải pháp tốt, hiệu năng cao. Báo cáo trình bày rõ ràng, có benchmark.");

        // Đề tài đề xuất đang chờ GV duyệt.
        Project proposal = project(course, researchCat, "Mô phỏng định tuyến mạng bằng đồ thị",
                "Trực quan hóa thuật toán định tuyến (Dijkstra, OSPF) trên đồ thị mạng.",
                ProjectStatus.PENDING, 0, 0);
        register(proposal, atlas, RegistrationStatus.PENDING, 1, "Nhóm Atlas đề xuất đề tài mô phỏng định tuyến.");

        requirement(course, webCat, "Xây dựng ứng dụng mạng có client-server, xử lý đồng thời & bảo mật.", 45,
                new String[] { "Giao thức & kết nối", "Xử lý đồng thời",
                        "Bảo mật", "Hiệu năng", "Báo cáo & demo" });
    }

    // Seed thông báo demo cho chuông Navbar. Xoá thông báo cũ của 2 user demo trước
    // để không bị nhân đôi mỗi lần khởi động (KHÔNG đụng thông báo của user khác).
    private void seedNotifications(User student, User teacher, Course course,
            Project p1, Project p2, Project p3) {
        jdbc.update("DELETE FROM notifications WHERE recipient_id IN (?, ?)",
                student.getId(), teacher.getId());

        Long cid = course.getId();

        // --- Cho sinh viên (student@gmail) — vài cái chưa đọc để badge đỏ hiện lên ---
        notification(student, "APPROVED", "Đề tài đã được duyệt",
                "Nhóm Phoenix đã được duyệt đề tài \"Website quản lý đồ án môn SE330\".",
                cid, p1.getId(), false, 8);
        notification(student, "TASK", "Bạn được giao task mới",
                "Task \"Xây dựng API backend\" đã được giao cho bạn trong nhóm Phoenix.",
                cid, p1.getId(), false, 45);
        notification(student, "JOIN_REQUEST", "Yêu cầu tham gia nhóm",
                "Lê Thị C muốn tham gia nhóm Phoenix. Vào trang nhóm để duyệt.",
                cid, p1.getId(), false, 180);
        notification(student, "GRADE", "Đồ án đã được chấm điểm",
                "Nhóm Nova nhận 88/100 cho đề tài \"Hệ thống gợi ý đề tài bằng Machine Learning\".",
                cid, p3.getId(), true, 60 * 24);
        notification(student, "REJECTED", "Đăng ký đề tài bị từ chối",
                "Đăng ký đề tài \"Nền tảng chấm bài tự động\" của nhóm Phoenix đã bị từ chối.",
                cid, null, true, 60 * 48);
        notification(student, "DEADLINE", "Sắp đến hạn nộp bài",
                "Đề tài của nhóm Phoenix còn 3 ngày đến hạn nộp. Hãy hoàn thiện sớm nhé!",
                cid, p1.getId(), true, 60 * 72);

        // --- Cho giảng viên (teacher@gmail) ---
        notification(teacher, "PROPOSAL", "Đề xuất đề tài mới",
                "Nhóm Aster đề xuất đề tài \"Ứng dụng điểm danh lớp học bằng QR\" — chờ bạn duyệt.",
                cid, p2.getId(), false, 30);
        notification(teacher, "SUBMISSION", "Có bài nộp mới",
                "Nhóm Phoenix vừa nộp bài cho đề tài \"Website quản lý đồ án môn SE330\".",
                cid, p1.getId(), false, 120);
        notification(teacher, "JOIN_REQUEST", "Yêu cầu vào lớp",
                "Có sinh viên mới gửi yêu cầu tham gia lớp SE330 - Công nghệ phần mềm.",
                cid, null, true, 60 * 20);
    }

    private void notification(User recipient, String type, String title, String message,
            Long courseId, Long projectId, boolean isRead, int minutesAgo) {
        notificationRepository.save(Notification.builder()
                .recipient(recipient).type(type).title(title).message(message)
                .courseId(courseId).projectId(projectId).isRead(isRead)
                .createdAt(LocalDateTime.now().minusMinutes(minutesAgo))
                .build());
    }

    private void enroll(Course course, User student) {
        courseRequest(course, student, JoinStatus.ACTIVE);
    }

    private void courseRequest(Course course, User student, JoinStatus status) {
        courseRequestRepository.save(CourseRequest.builder()
                .course(course).student(student).requestAt(LocalDateTime.now())
                .status(status).build());
    }

    private Project project(Course course, Category category, String title, String description,
            ProjectStatus status, int startOffsetDays, int endOffsetDays) {
        return projectRepository.save(Project.builder()
                .title(title).description(description).status(status)
                .startDate(LocalDate.now().plusDays(startOffsetDays))
                .endDate(endOffsetDays == 0 ? null : LocalDate.now().plusDays(endOffsetDays))
                .course(course).category(category).build());
    }

    private void register(Project project, Group group, RegistrationStatus status, int daysAgo, String note) {
        Registration r = Registration.builder()
                .project(project).group(group)
                .registeredAt(LocalDateTime.now().minusDays(daysAgo))
                .status(status).note(note).build();
        if (status == RegistrationStatus.APPROVED) {
            r.setApprovedAt(LocalDateTime.now().minusDays(Math.max(0, daysAgo - 1)));
        }
        registrationRepository.save(r);
    }

    private void gradedSubmission(Project project, Group group, String filePath, int daysAgo,
            int score, User grader, String feedback) {
        Submission sub = Submission.builder()
                .project(project).group(group).status(SubmissionStatus.GRADED)
                .filePath(filePath).submittedAt(LocalDateTime.now().minusDays(daysAgo)).build();
        Grade grade = Grade.builder()
                .submission(sub).score(score).maxScore(100).feedback(feedback)
                .gradedBy(grader).gradedAt(LocalDateTime.now().minusDays(Math.max(0, daysAgo - 1))).build();
        sub.setGrade(grade);
        submissionRepository.save(sub);
    }

    private void member(Group group, User user, GroupMemberStatus status, boolean leader) {
        groupMemberRepository.save(GroupMember.builder()
                .group(group).user(user).joinedDate(LocalDate.now())
                .status(status).isLeader(leader).build());
    }

    private void task(Project project, Group group, User assignee, String title, TaskStatus status, int deadlineDays) {
        // Mặc định: task tạo ~10 ngày trước; cập nhật gần đây (trừ TODO chưa đụng tới).
        task(project, group, assignee, title, status, deadlineDays, 10, status == TaskStatus.TODO ? null : 2);
    }

    // Bản đầy đủ: trải ngày tạo/cập nhật để lịch hoạt động (heatmap) trông sống động.
    private void task(Project project, Group group, User assignee, String title, TaskStatus status,
            int deadlineDays, int createdDaysAgo, Integer updatedDaysAgo) {
        taskRepository.save(Task.builder()
                .title(title).description(title)
                .status(status).assignedTo(assignee).createdBy(group.getLeader())
                .group(group).project(project)
                .deadline(LocalDateTime.now().plusDays(deadlineDays))
                .createdAt(LocalDateTime.now().minusDays(Math.max(0, createdDaysAgo)))
                .updatedAt(updatedDaysAgo == null ? null
                        : LocalDateTime.now().minusDays(Math.max(0, updatedDaysAgo)))
                .build());
    }

    private Course course(String name, String code, User teacher,
            int startOffsetDays, int endOffsetDays, int maxStudents) {
        Course c = new Course();
        c.setName(name);
        c.setCode(code);
        c.setLecturer(teacher);
        c.setMaxStudents(maxStudents);
        c.setStartDate(LocalDate.now().plusDays(startOffsetDays));
        c.setEndDate(LocalDate.now().plusDays(endOffsetDays));
        return courseRepository.save(c);
    }

    private void submission(Project project, Group group, SubmissionStatus status, String filePath, int daysAgo) {
        submissionRepository.save(Submission.builder()
                .project(project).group(group).status(status)
                .filePath(filePath).submittedAt(LocalDateTime.now().minusDays(daysAgo)).build());
    }

    private void requirement(Course course, Category category, String description, int deadlineDays, String[] criteria) {
        Requirement requirement = Requirement.builder()
                .course(course).category(category).description(description)
                .deadline(LocalDate.now().plusDays(deadlineDays)).build();
        for (int idx = 0; idx < criteria.length; idx++) {
            requirement.getCriteria().add(RubricCriterion.builder()
                    .requirement(requirement).name(criteria[idx]).maxScore(10).orderIndex(idx).build());
        }
        requirementRepository.save(requirement);
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
