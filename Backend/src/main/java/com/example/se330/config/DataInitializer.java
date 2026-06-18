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
        ensureSubmissionRequirementSchema();

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
        if (userRepository.findByEmail("sv1@gm.uit.edu.vn").isPresent()) {
            return; // đã seed
        }

        String[] teacherNames = {
                "Nguyễn Văn An", "Trần Thị Bình", "Lê Văn Cường", "Phạm Thị Dung", "Hoàng Văn Em"
        };
        List<User> t = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            t.add(ensureUser("gv" + (i + 1) + "@gm.uit.edu.vn", teacherNames[i], Role.TEACHER));
        }

        String[] studentNames = {
                "Trần Văn Bảo", "Lê Thị Cúc", "Phạm Văn Dũng", "Hoàng Thị Em", "Vũ Văn Phúc",
                "Đặng Thị Giang", "Bùi Văn Hùng", "Đỗ Thị Hoa", "Hồ Văn Khoa", "Ngô Thị Lan",
                "Dương Văn Minh", "Lý Thị Nga", "Phan Văn Phong", "Võ Thị Quỳnh", "Đinh Văn Sơn",
                "Tô Thị Trang", "Mai Văn Uy", "Chu Thị Vân", "Đào Văn Xuân", "Cao Thị Yến"
        };
        List<User> s = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            s.add(ensureUser("sv" + (i + 1) + "@gm.uit.edu.vn", studentNames[i], Role.STUDENT));
        }

        Category webCat = cat("Web App");
        Category aiCat = cat("Research");
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

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
        submission(pAlpha, gAlpha, s.get(0), LocalDateTime.now().minusDays(3),
                "/files/submissions/demo/baocao_alpha.pdf");
        Submission subGamma = submission(pGamma, gGamma, s.get(8), LocalDateTime.now().minusWeeks(1),
                "/files/submissions/demo/baocao_gamma.pdf");
        Submission subDelta = submission(pDelta, gDelta, s.get(11), LocalDateTime.now().minusDays(2),
                "/files/submissions/demo/baocao_delta.pdf");
        // Nhóm Epsilon nộp bài (nộp trễ) → xuất hiện trong báo cáo với thành viên bị trừ 30%.
        submission(pEpsilon, gEpsilon, s.get(14), LocalDateTime.now().minusDays(1),
                "/files/submissions/demo/baocao_epsilon.pdf");

        // --- Điểm (đã chấm có nhận xét / nộp rồi nhưng chưa chấm) ---
        grade(subGamma, 8, 10, "Làm tốt, UI đẹp. Cần bổ sung unit test.", t.get(1),
                new String[] { "Mô hình ERD", "Chuẩn hóa", "Truy vấn" }, new int[] { 3, 3, 2 }, new int[] { 4, 3, 3 });
        grade(subDelta, 6, 10, "Nộp trễ, độ chính xác mô hình chưa cao.", t.get(2),
                new String[] { "Dữ liệu", "Mô hình", "Đánh giá" }, new int[] { 2, 2, 2 }, new int[] { 3, 4, 3 });
        // subAlpha: đã nộp nhưng chưa chấm

        // --- Task: nhiều task có deadline + mốc thời gian thực tế để báo cáo công việc
        // hiển thị phong phú (đúng hạn / trễ hạn / quá hạn chưa xong, thời gian TB/task).
        // Quy ước thời gian: created = lúc tạo, deadline = hạn chót, updated = lúc hoàn thành.

        // === Nhóm Alpha (pAlpha) — leader Bảo(0), Cúc(1), Dũng(2) ===
        // s0: 4 đúng hạn + 1 trễ + 1 đang làm
        task(pAlpha, gAlpha, "Thiết kế cơ sở dữ liệu", "ERD + script khởi tạo.", TaskStatus.DONE, s.get(0), s.get(0),
                now.minusDays(25), now.minusDays(15), now.minusDays(17));
        task(pAlpha, gAlpha, "Cài đặt API mượn/trả sách", "REST API Spring Boot.", TaskStatus.DONE, s.get(0), s.get(0),
                now.minusDays(22), now.minusDays(12), now.minusDays(13));
        task(pAlpha, gAlpha, "Tích hợp xác thực JWT", "Access + refresh token.", TaskStatus.DONE, s.get(0), s.get(0),
                now.minusDays(18), now.minusDays(9), now.minusDays(11));
        task(pAlpha, gAlpha, "Viết tài liệu API (Swagger)", "Mô tả endpoint.", TaskStatus.DONE, s.get(0), s.get(0),
                now.minusDays(14), now.minusDays(6), now.minusDays(7));
        task(pAlpha, gAlpha, "Tối ưu truy vấn báo cáo", "Index + phân trang.", TaskStatus.DONE, s.get(0), s.get(0),
                now.minusDays(12), now.minusDays(5), now.minusDays(2)); // trễ 3 ngày
        task(pAlpha, gAlpha, "Chuẩn bị slide demo", "Slide trình bày cuối kỳ.", TaskStatus.IN_PROGRESS, s.get(0), s.get(0),
                now.minusDays(4), now.plusDays(3), now.minusDays(1));
        // s1: 4 đúng hạn + 1 quá hạn chưa xong
        task(pAlpha, gAlpha, "Giao diện danh sách sách", "React + Tailwind.", TaskStatus.DONE, s.get(1), s.get(0),
                now.minusDays(24), now.minusDays(14), now.minusDays(16));
        task(pAlpha, gAlpha, "Giao diện chi tiết & mượn sách", "Trang chi tiết sách.", TaskStatus.DONE, s.get(1), s.get(0),
                now.minusDays(20), now.minusDays(10), now.minusDays(12));
        task(pAlpha, gAlpha, "Trang quản lý độc giả", "CRUD độc giả.", TaskStatus.DONE, s.get(1), s.get(0),
                now.minusDays(16), now.minusDays(7), now.minusDays(8));
        task(pAlpha, gAlpha, "Tối ưu giao diện mobile", "Responsive layout.", TaskStatus.DONE, s.get(1), s.get(0),
                now.minusDays(10), now.minusDays(3), now.minusDays(4));
        task(pAlpha, gAlpha, "Kiểm thử giao diện E2E", "Cypress test.", TaskStatus.TODO, s.get(1), s.get(0),
                now.minusDays(8), now.minusDays(1), now.minusDays(1)); // quá hạn chưa xong
        // s2: 1 đúng hạn + 1 trễ + 1 quá hạn (BLOCKED) + 1 đang chờ
        task(pAlpha, gAlpha, "Thiết kế ERD chi tiết", "Quan hệ bảng đầy đủ.", TaskStatus.DONE, s.get(2), s.get(0),
                now.minusDays(23), now.minusDays(13), now.minusDays(15));
        task(pAlpha, gAlpha, "Cài đặt module thống kê", "Báo cáo mượn/trả.", TaskStatus.DONE, s.get(2), s.get(0),
                now.minusDays(15), now.minusDays(7), now.minusDays(3)); // trễ 4 ngày
        task(pAlpha, gAlpha, "Sửa lỗi phân quyền", "Chặn do thiếu role guard.", TaskStatus.BLOCKED, s.get(2), s.get(0),
                now.minusDays(9), now.minusDays(2), now.minusDays(1)); // quá hạn chưa xong
        task(pAlpha, gAlpha, "Viết unit test repository", "JUnit + Mockito.", TaskStatus.TODO, s.get(2), s.get(0),
                now.minusDays(3), now.plusDays(5), now.minusDays(1));

        // === Nhóm Gamma (pGamma) — leader Khoa(8), Lan(9), Minh(10) ===
        task(pGamma, gGamma, "Thiết kế CSDL thu chi", "Bảng giao dịch + danh mục.", TaskStatus.DONE, s.get(8), s.get(8),
                now.minusDays(21), now.minusDays(12), now.minusDays(14));
        task(pGamma, gGamma, "API ghi nhận giao dịch", "Thêm/sửa/xóa giao dịch.", TaskStatus.DONE, s.get(8), s.get(8),
                now.minusDays(17), now.minusDays(8), now.minusDays(9));
        task(pGamma, gGamma, "Tích hợp biểu đồ chi tiêu", "Chart.js.", TaskStatus.DONE, s.get(8), s.get(8),
                now.minusDays(12), now.minusDays(4), now.minusDays(5));
        task(pGamma, gGamma, "Báo cáo theo tháng (PDF)", "Xuất PDF.", TaskStatus.IN_PROGRESS, s.get(8), s.get(8),
                now.minusDays(5), now.plusDays(4), now.minusDays(1));
        task(pGamma, gGamma, "Giao diện nhập giao dịch", "Form nhập liệu.", TaskStatus.DONE, s.get(9), s.get(8),
                now.minusDays(19), now.minusDays(10), now.minusDays(11));
        task(pGamma, gGamma, "Màn hình tổng quan", "Dashboard thu chi.", TaskStatus.DONE, s.get(9), s.get(8),
                now.minusDays(14), now.minusDays(6), now.minusDays(7));
        task(pGamma, gGamma, "Lọc giao dịch theo danh mục", "Bộ lọc + tìm kiếm.", TaskStatus.DONE, s.get(9), s.get(8),
                now.minusDays(9), now.minusDays(2), now.minusDays(3));
        task(pGamma, gGamma, "Đồng bộ dữ liệu offline", "Local cache.", TaskStatus.TODO, s.get(9), s.get(8),
                now.minusDays(7), now.minusDays(1), now.minusDays(1)); // quá hạn chưa xong
        task(pGamma, gGamma, "Viết unit test service", "JUnit + Mockito.", TaskStatus.DONE, s.get(10), s.get(8),
                now.minusDays(13), now.minusDays(6), now.minusDays(2)); // trễ 4 ngày
        task(pGamma, gGamma, "Tài liệu hướng dẫn sử dụng", "User guide.", TaskStatus.DONE, s.get(10), s.get(8),
                now.minusDays(8), now.minusDays(1), now.minusDays(2));
        task(pGamma, gGamma, "Kiểm thử API Postman", "Bộ test collection.", TaskStatus.IN_PROGRESS, s.get(10), s.get(8),
                now.minusDays(4), now.plusDays(3), now.minusDays(1));

        // === Nhóm Delta (pDelta, quá hạn) — leader Nga(11), Phong(12), Quỳnh(13) ===
        task(pDelta, gDelta, "Thu thập dữ liệu khuôn mặt", "Bộ ảnh huấn luyện.", TaskStatus.DONE, s.get(11), s.get(11),
                now.minusDays(30), now.minusDays(20), now.minusDays(22));
        task(pDelta, gDelta, "Tiền xử lý ảnh", "Chuẩn hóa, augmentation.", TaskStatus.DONE, s.get(11), s.get(11),
                now.minusDays(25), now.minusDays(16), now.minusDays(18));
        task(pDelta, gDelta, "Huấn luyện mô hình CNN", "Train + tuning.", TaskStatus.DONE, s.get(11), s.get(11),
                now.minusDays(20), now.minusDays(12), now.minusDays(8)); // trễ 4 ngày
        task(pDelta, gDelta, "Đánh giá độ chính xác", "Confusion matrix.", TaskStatus.DONE, s.get(11), s.get(11),
                now.minusDays(14), now.minusDays(8), now.minusDays(3)); // trễ 5 ngày
        task(pDelta, gDelta, "Pipeline nhận diện", "Đầu vào → kết quả.", TaskStatus.DONE, s.get(12), s.get(11),
                now.minusDays(22), now.minusDays(13), now.minusDays(15));
        task(pDelta, gDelta, "Tích hợp camera điểm danh", "Realtime camera.", TaskStatus.DONE, s.get(12), s.get(11),
                now.minusDays(16), now.minusDays(9), now.minusDays(5)); // trễ 4 ngày
        task(pDelta, gDelta, "Tối ưu tốc độ nhận diện", "Giảm latency.", TaskStatus.BLOCKED, s.get(12), s.get(11),
                now.minusDays(10), now.minusDays(3), now.minusDays(1)); // quá hạn chưa xong
        task(pDelta, gDelta, "Giao diện điểm danh", "Màn hình điểm danh.", TaskStatus.DONE, s.get(13), s.get(11),
                now.minusDays(18), now.minusDays(9), now.minusDays(10));
        task(pDelta, gDelta, "Xuất báo cáo điểm danh", "Excel/PDF.", TaskStatus.DONE, s.get(13), s.get(11),
                now.minusDays(12), now.minusDays(6), now.minusDays(2)); // trễ 4 ngày
        task(pDelta, gDelta, "Viết báo cáo đồ án", "Tổng hợp tài liệu.", TaskStatus.TODO, s.get(13), s.get(11),
                now.minusDays(6), now.minusDays(2), now.minusDays(1)); // quá hạn chưa xong

        // === Nhóm Epsilon (pEpsilon) — leader Sơn(14), Trang(15) — nộp trễ nên bị trừ 30% ===
        // s14: 2 đúng hạn + 2 trễ deadline → bị trừ 30% đóng góp
        task(pEpsilon, gEpsilon, "Thiết kế màn chơi 2D", "Tilemap + level design.", TaskStatus.DONE, s.get(14), s.get(14),
                now.minusDays(20), now.minusDays(11), now.minusDays(13));
        task(pEpsilon, gEpsilon, "Cơ chế nhân vật chính", "Di chuyển, nhảy, va chạm.", TaskStatus.DONE, s.get(14), s.get(14),
                now.minusDays(16), now.minusDays(8), now.minusDays(9));
        task(pEpsilon, gEpsilon, "Hệ thống kẻ địch & AI", "Tuần tra, tấn công.", TaskStatus.DONE, s.get(14), s.get(14),
                now.minusDays(12), now.minusDays(5), now.minusDays(2)); // trễ 3 ngày
        task(pEpsilon, gEpsilon, "Tối ưu hiệu năng game", "Object pooling.", TaskStatus.DONE, s.get(14), s.get(14),
                now.minusDays(8), now.minusDays(3), now.plusDays(0)); // trễ 3 ngày
        // s15: 2 đúng hạn + 1 quá hạn chưa xong → bị trừ 30% đóng góp
        task(pEpsilon, gEpsilon, "Âm thanh & hiệu ứng", "SFX + nhạc nền.", TaskStatus.DONE, s.get(15), s.get(14),
                now.minusDays(18), now.minusDays(10), now.minusDays(11));
        task(pEpsilon, gEpsilon, "Giao diện menu & HUD", "Màn hình chính, điểm số.", TaskStatus.DONE, s.get(15), s.get(14),
                now.minusDays(13), now.minusDays(6), now.minusDays(7));
        task(pEpsilon, gEpsilon, "Lưu/đọc tiến trình chơi", "Save game.", TaskStatus.IN_PROGRESS, s.get(15), s.get(14),
                now.minusDays(7), now.minusDays(2), now.minusDays(1)); // quá hạn chưa xong

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

    private Submission submission(Project project, Group group, User submittedBy,
            LocalDateTime submittedAt, String filePath) {
        return submissionRepository.save(Submission.builder()
                .project(project).group(group).submittedBy(submittedBy)
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
            User assignedTo, User createdBy, LocalDateTime createdAt, LocalDateTime deadline, LocalDateTime updatedAt) {
        taskRepository.save(Task.builder()
                .title(title).description(desc).status(status).assignedTo(assignedTo).createdBy(createdBy)
                .group(group).project(project).deadline(deadline)
                .createdAt(createdAt).updatedAt(updatedAt).build());
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

    private void ensureSubmissionRequirementSchema() {
        try {
            jdbc.execute("""
                    CREATE TABLE IF NOT EXISTS requirement_submission_requirements (
                        submission_requirement_id BIGINT NOT NULL AUTO_INCREMENT,
                        requirement_id BIGINT NULL,
                        content VARCHAR(500) NULL,
                        order_index INT NULL,
                        PRIMARY KEY (submission_requirement_id)
                    )
                    """);
        } catch (Exception ignored) {
        }

        if (tableExists("requirement_submission_requirements")
                && !columnExists("requirement_submission_requirements", "submission_requirement_id")) {
            dropForeignKeys("requirement_submission_requirements");
            try {
                jdbc.execute("ALTER TABLE requirement_submission_requirements DROP PRIMARY KEY");
            } catch (Exception ignored) {
            }
            try {
                jdbc.execute("""
                        ALTER TABLE requirement_submission_requirements
                        ADD COLUMN submission_requirement_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST
                        """);
            } catch (Exception e) {
                System.out.println("Không nâng được bảng requirement_submission_requirements: " + e.getMessage());
            }
            try {
                jdbc.execute("""
                        ALTER TABLE requirement_submission_requirements
                        ADD INDEX idx_req_submission_req_requirement (requirement_id)
                        """);
            } catch (Exception ignored) {
            }
            try {
                jdbc.execute("""
                        ALTER TABLE requirement_submission_requirements
                        ADD CONSTRAINT fk_req_submission_req_requirement
                        FOREIGN KEY (requirement_id) REFERENCES requirements(requirement_id)
                        """);
            } catch (Exception ignored) {
            }
        }

        if (tableExists("requirement_files") && !columnExists("requirement_files", "submission_requirement_id")) {
            try {
                jdbc.execute("ALTER TABLE requirement_files ADD COLUMN submission_requirement_id BIGINT NULL");
            } catch (Exception ignored) {
            }
        }
        if (tableExists("submissions") && !columnExists("submissions", "submission_requirement_id")) {
            try {
                jdbc.execute("ALTER TABLE submissions ADD COLUMN submission_requirement_id BIGINT NULL");
            } catch (Exception ignored) {
            }
        }
        if (tableExists("submissions") && !columnExists("submissions", "label")) {
            try {
                jdbc.execute("ALTER TABLE submissions ADD COLUMN label VARCHAR(255) NULL");
            } catch (Exception ignored) {
            }
        }
    }

    private boolean tableExists(String table) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
                Integer.class,
                table);
        return count != null && count > 0;
    }

    private boolean columnExists(String table, String column) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM information_schema.COLUMNS "
                        + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
                Integer.class,
                table,
                column);
        return count != null && count > 0;
    }

    private void dropForeignKeys(String table) {
        try {
            List<String> constraints = jdbc.queryForList(
                    "SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE "
                            + "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? "
                            + "AND REFERENCED_TABLE_NAME IS NOT NULL",
                    String.class,
                    table);
            for (String constraint : constraints) {
                try {
                    jdbc.execute("ALTER TABLE `" + table + "` DROP FOREIGN KEY `" + constraint + "`");
                } catch (Exception ignored) {
                }
            }
        } catch (Exception ignored) {
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
