package com.example.se330.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.se330.entity.Category;
import com.example.se330.entity.Course;
import com.example.se330.entity.CourseRequest;
import com.example.se330.entity.Group;
import com.example.se330.entity.GroupMember;
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
import com.example.se330.repository.ProjectRepository;
import com.example.se330.repository.RegistrationRepository;
import com.example.se330.repository.RequirementRepository;
import com.example.se330.repository.SubmissionRepository;
import com.example.se330.repository.TaskRepository;
import com.example.se330.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private static final String DEMO_COURSE_CODE = "SE330A";

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
    private final JdbcTemplate jdbc;

    @Override
    public void run(String... args) throws Exception {
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

        // Lớp demo SE330A được làm mới mỗi lần khởi động để luôn đủ data test
        // (KHÔNG đụng các lớp thật khác trong DB).
        wipeDemoCourse();
        seedDemo(teacher, studentA);
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

    private void wipeDemoCourse() {
        Long cid = courseRepository.findByCode(DEMO_COURSE_CODE).map(Course::getId).orElse(null);
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
        Category webCat = categoryRepository.findByIsActiveTrue().stream().findFirst().orElse(null);

        User b = ensureUser("student2@gmail.com", "Trần Văn B", Role.STUDENT);
        User c = ensureUser("student3@gmail.com", "Lê Thị C", Role.STUDENT);
        User d = ensureUser("student4@gmail.com", "Phạm Văn D", Role.STUDENT);
        User e = ensureUser("student5@gmail.com", "Hoàng Thị E", Role.STUDENT);
        User f = ensureUser("student6@gmail.com", "Vũ Văn F", Role.STUDENT);

        Course course = new Course();
        course.setName("SE330 - Công nghệ phần mềm");
        course.setCode(DEMO_COURSE_CODE);
        course.setLecturer(teacher);
        course.setMaxStudents(60);
        course.setStartDate(LocalDate.now().minusDays(30));
        course.setEndDate(LocalDate.now().plusDays(90));
        course = courseRepository.save(course);

        for (User s : List.of(studentA, b, c, d, e, f)) {
            enroll(course, s);
        }

        // --- Nhóm Phoenix: A trưởng nhóm, B chính thức; C xin vào (PENDING), D được mời (INVITED) ---
        Group phoenix = groupRepository.save(Group.builder()
                .name("Nhóm Phoenix").description("Nhóm đã có đồ án — đủ task/bài nộp để test")
                .course(course).leader(studentA).build());
        member(phoenix, studentA, GroupMemberStatus.ACTIVE, true);
        member(phoenix, b, GroupMemberStatus.ACTIVE, false);
        member(phoenix, c, GroupMemberStatus.PENDING, false);   // yêu cầu xin vào (leader duyệt)
        member(phoenix, d, GroupMemberStatus.INVITED, false);   // lời mời (D chấp nhận/từ chối)

        Project p1 = projectRepository.save(Project.builder()
                .title("Website quản lý đồ án môn SE330")
                .description("Hệ thống quản lý đề tài, nhóm sinh viên, task và tiến độ nộp bài.")
                .status(ProjectStatus.IN_PROGRESS)
                .startDate(LocalDate.now().minusDays(20)).endDate(LocalDate.now().plusDays(40))
                .course(course).category(webCat).build());
        registrationRepository.save(Registration.builder()
                .project(p1).group(phoenix)
                .registeredAt(LocalDateTime.now().minusDays(20)).approvedAt(LocalDateTime.now().minusDays(19))
                .status(RegistrationStatus.APPROVED).note("Nhóm Phoenix nhận đề tài.").build());

        task(p1, phoenix, studentA, "Thiết kế cơ sở dữ liệu", TaskStatus.DONE, -2);
        task(p1, phoenix, studentA, "Xây dựng API backend", TaskStatus.IN_PROGRESS, 7);
        task(p1, phoenix, b, "Thiết kế giao diện Figma", TaskStatus.REVIEW, 3);
        task(p1, phoenix, b, "Viết tài liệu SRS", TaskStatus.TODO, 14);

        submissionRepository.save(Submission.builder()
                .project(p1).group(phoenix).status(SubmissionStatus.SUBMITTED)
                .filePath("/submissions/phoenix/srs-v1.pdf").submittedAt(LocalDateTime.now().minusDays(5)).build());

        // --- Nhóm Aster: E trưởng nhóm, đề xuất đề tài đang CHỜ DUYỆT (cho GV duyệt/từ chối) ---
        Group aster = groupRepository.save(Group.builder()
                .name("Nhóm Aster").description("Nhóm có đề xuất đề tài đang chờ giảng viên duyệt")
                .course(course).leader(e).build());
        member(aster, e, GroupMemberStatus.ACTIVE, true);

        Project p2 = projectRepository.save(Project.builder()
                .title("Ứng dụng điểm danh lớp học bằng QR")
                .description("Tạo phiên điểm danh, sinh viên quét mã QR và theo dõi lịch sử tham gia.")
                .status(ProjectStatus.PENDING)
                .startDate(LocalDate.now()).course(course).category(webCat).build());
        registrationRepository.save(Registration.builder()
                .project(p2).group(aster).registeredAt(LocalDateTime.now().minusDays(1))
                .status(RegistrationStatus.PENDING).note("Nhóm Aster đề xuất đề tài QR.").build());

        // --- Yêu cầu đồ án + barem chấm điểm ---
        Requirement requirement = Requirement.builder()
                .course(course).category(webCat)
                .description("Xây dựng ứng dụng web quản lý đồ án; nộp báo cáo và mã nguồn.")
                .deadline(LocalDate.now().plusDays(40)).build();
        String[] critNames = {
                "Thiết kế & kiến trúc", "Chức năng hoàn thiện",
                "Giao diện UI/UX", "Báo cáo & thuyết trình" };
        for (int i = 0; i < critNames.length; i++) {
            requirement.getCriteria().add(RubricCriterion.builder()
                    .requirement(requirement).name(critNames[i]).maxScore(10).orderIndex(i).build());
        }
        requirementRepository.save(requirement);

        // Vũ Văn F (student6) đã vào lớp nhưng CHƯA có nhóm → để test tạo nhóm / được mời.
        System.out.println("Seeded demo " + DEMO_COURSE_CODE
                + ": 6 SV (student..student6 @gmail / 123123), 2 nhóm, đồ án duyệt+chờ duyệt, task 4 cột, bài nộp, yêu cầu+barem.");
    }

    private void enroll(Course course, User student) {
        courseRequestRepository.save(CourseRequest.builder()
                .course(course).student(student).requestAt(LocalDateTime.now())
                .status(JoinStatus.ACTIVE).build());
    }

    private void member(Group group, User user, GroupMemberStatus status, boolean leader) {
        groupMemberRepository.save(GroupMember.builder()
                .group(group).user(user).joinedDate(LocalDate.now())
                .status(status).isLeader(leader).build());
    }

    private void task(Project project, Group group, User assignee, String title, TaskStatus status, int deadlineDays) {
        taskRepository.save(Task.builder()
                .title(title).description(title)
                .status(status).assignedTo(assignee).createdBy(group.getLeader())
                .group(group).project(project)
                .deadline(LocalDateTime.now().plusDays(deadlineDays)).build());
    }

    private User ensureUser(String email, String name, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setName(name);
            u.setEmail(email);
            u.setPassword(passwordEncoder.encode("123123"));
            u.setUid(UUID.randomUUID().toString());
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
