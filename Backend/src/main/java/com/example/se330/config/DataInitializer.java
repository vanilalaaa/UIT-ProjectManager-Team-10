package com.example.se330.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
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
import com.example.se330.repository.GroupMemberRepository;
import com.example.se330.repository.GroupRepository;
import com.example.se330.repository.ProjectRepository;
import com.example.se330.repository.RegistrationRepository;
import com.example.se330.repository.RequirementRepository;
import com.example.se330.repository.TaskRepository;
import com.example.se330.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
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

    @Override
    public void run(String... args) throws Exception {
        ensureUser("admin@gmail.com", "Admin", Role.ADMIN);
        User teacher = ensureUser("teacher@gmail.com", "Teacher", Role.TEACHER);
        User student = ensureUser("student@gmail.com", "Student", Role.STUDENT);

        seedCategory("Web App", "Ứng dụng web, API và quản lý dữ liệu");
        seedCategory("Research", "Đề tài nghiên cứu");
        seedCategory("Capstone", "Đồ án tốt nghiệp");
        seedCategory("UI/UX Design", "Thiết kế trải nghiệm người dùng");
        seedCategory("Paper", "Bài báo khoa học");

        if (courseRepository.count() == 0) {
            Category webCat = categoryRepository.findByIsActiveTrue().stream().findFirst().orElse(null);

            Course course = new Course();
            course.setName("SE330 - Công nghệ phần mềm");
            course.setCode("SE330A");
            course.setLecturer(teacher);
            course.setMaxStudents(60);
            course.setStartDate(LocalDate.now().minusDays(30));
            course.setEndDate(LocalDate.now().plusDays(90));
            course = courseRepository.save(course);

            courseRequestRepository.save(CourseRequest.builder()
                    .course(course)
                    .student(student)
                    .requestAt(LocalDateTime.now())
                    .status(JoinStatus.ACTIVE)
                    .build());

            Group group = groupRepository.save(Group.builder()
                    .name("Nhóm Phoenix")
                    .description("Nhóm đồ án mẫu môn SE330")
                    .course(course)
                    .leader(student)
                    .build());

            groupMemberRepository.save(GroupMember.builder()
                    .group(group)
                    .user(student)
                    .joinedDate(LocalDate.now())
                    .status(GroupMemberStatus.ACTIVE)
                    .isLeader(true)
                    .build());

            Project project = projectRepository.save(Project.builder()
                    .title("Website quản lý đồ án môn SE330")
                    .description("Hệ thống quản lý đề tài, nhóm sinh viên, task và tiến độ nộp bài.")
                    .status(ProjectStatus.IN_PROGRESS)
                    .startDate(LocalDate.now().minusDays(20))
                    .endDate(LocalDate.now().plusDays(40))
                    .course(course)
                    .category(webCat)
                    .build());

            taskRepository.save(Task.builder()
                    .title("Thiết kế cơ sở dữ liệu")
                    .description("Vẽ ERD và tạo schema cho hệ thống")
                    .status(TaskStatus.IN_PROGRESS)
                    .assignedTo(student)
                    .createdBy(student)
                    .group(group)
                    .project(project)
                    .deadline(LocalDateTime.now().plusDays(7))
                    .build());

            Requirement requirement = Requirement.builder()
                    .course(course)
                    .category(webCat)
                    .description("Xây dựng ứng dụng web quản lý đồ án; nộp báo cáo và mã nguồn.")
                    .deadline(LocalDate.now().plusDays(40))
                    .build();
            String[] critNames = {
                    "Thiết kế & kiến trúc", "Chức năng hoàn thiện",
                    "Giao diện UI/UX", "Báo cáo & thuyết trình" };
            for (int i = 0; i < critNames.length; i++) {
                requirement.getCriteria().add(RubricCriterion.builder()
                        .requirement(requirement)
                        .name(critNames[i])
                        .maxScore(10)
                        .orderIndex(i)
                        .build());
            }
            requirementRepository.save(requirement);

            registrationRepository.save(Registration.builder()
                    .project(project)
                    .group(group)
                    .registeredAt(LocalDateTime.now().minusDays(20))
                    .approvedAt(LocalDateTime.now().minusDays(19))
                    .status(RegistrationStatus.APPROVED)
                    .note("Nhóm Phoenix nhận đề tài đồ án môn SE330.")
                    .build());

            System.out.println("Seeded sample course/group/project/task/requirement/registration for SE330.");
        }
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
