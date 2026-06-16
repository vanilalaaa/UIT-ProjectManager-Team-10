package com.example.se330.service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.se330.dto.UserDto;
import com.example.se330.dto.CategoryDto;
import com.example.se330.dto.course.CourseCardResponse;
import com.example.se330.dto.course.CourseResponse;
import com.example.se330.dto.project.ProjectResponse;
import com.example.se330.dto.search.GlobalSearchResult;
import com.example.se330.entity.Course;
import com.example.se330.entity.Project;
import com.example.se330.enums.ProjectStatus;
import com.example.se330.enums.Role;
import com.example.se330.repository.CourseRepository;

@Service
public class GlobalSearchService {
    private static final int MAX_RESULTS = 8;

    private final CourseService courseService;
    private final StudentService studentService;
    private final AdminUserService adminUserService;
    private final AdminCategoryService adminCategoryService;
    private final CourseRepository courseRepository;

    public GlobalSearchService(
            CourseService courseService,
            StudentService studentService,
            AdminUserService adminUserService,
            AdminCategoryService adminCategoryService,
            CourseRepository courseRepository) {
        this.courseService = courseService;
        this.studentService = studentService;
        this.adminUserService = adminUserService;
        this.adminCategoryService = adminCategoryService;
        this.courseRepository = courseRepository;
    }

    @Transactional(readOnly = true)
    public List<GlobalSearchResult> search(Long userId, Role role, String query) {
        String normalizedQuery = normalize(query);
        if (normalizedQuery.isBlank()) {
            return List.of();
        }

        List<GlobalSearchResult> results = switch (role) {
            case STUDENT -> searchForStudent(userId);
            case TEACHER -> searchForTeacher(userId);
            case ADMIN -> searchForAdmin(query);
        };

        return results.stream()
                .filter(result -> normalize(result.getKeywords()).contains(normalizedQuery))
                .limit(MAX_RESULTS)
                .toList();
    }

    private List<GlobalSearchResult> searchForStudent(Long studentId) {
        List<GlobalSearchResult> results = new ArrayList<>();

        for (CourseCardResponse course : courseService.getStudentCourses(studentId)) {
            results.add(result(
                    "course-" + course.getCourseId(),
                    course.getName(),
                    course.getCode(),
                    "/my-course/" + course.getCourseId(),
                    "Lớp học",
                    course.getLecturerName()));
        }

        for (ProjectResponse project : studentService.getStudentProjects(studentId)) {
            results.add(result(
                    "project-" + project.getProjectId(),
                    project.getTitle(),
                    project.getCourseName(),
                    "/my-project/" + project.getProjectId(),
                    "Đồ án",
                    join(project.getDescription(), project.getCategoryName(), String.valueOf(project.getStatus()))));
        }

        return results;
    }

    private List<GlobalSearchResult> searchForTeacher(Long teacherId) {
        List<GlobalSearchResult> results = new ArrayList<>();

        for (Course course : courseRepository.findByLecturer_Id(teacherId)) {
            results.add(result(
                    "teacher-course-" + course.getId(),
                    course.getName(),
                    course.getCode(),
                    "/teacher/my-course/" + course.getId(),
                    "Lớp học",
                    ""));

            for (Project project : course.getProjects()) {
                if (project.getStatus() == ProjectStatus.PENDING) {
                    continue;
                }
                results.add(result(
                        "teacher-project-" + project.getId(),
                        project.getTitle(),
                        course.getName(),
                        "/teacher/my-course/" + course.getId() + "/project-list/" + project.getId() + "/projectdetail",
                        "Đồ án",
                        join(project.getDescription(),
                                project.getCategory() != null ? project.getCategory().getName() : null,
                                String.valueOf(project.getStatus()))));
            }
        }

        return results;
    }

    private List<GlobalSearchResult> searchForAdmin(String query) {
        List<GlobalSearchResult> results = new ArrayList<>();

        for (CourseResponse course : courseService.getAllCourses()) {
            results.add(result(
                    "admin-course-" + course.getCourseId(),
                    course.getName(),
                    course.getCode(),
                    "/admin/courses",
                    "Lớp học",
                    course.getLecturerName()));
        }

        for (UserDto user : adminUserService.listUsers(0, 100, query, null).getContent()) {
            results.add(result(
                    "admin-user-" + user.getId(),
                    user.getName(),
                    user.getEmail(),
                    "/admin/users",
                    "Người dùng",
                    join(user.getUid(), user.getRole(), String.valueOf(user.getIsActive()))));
        }

        for (CategoryDto category : adminCategoryService.listCategories(0, 100, query).getContent()) {
            results.add(result(
                    "admin-category-" + category.getCategoryId(),
                    category.getName(),
                    category.getDescription(),
                    "/admin/categories",
                    "Danh mục",
                    String.valueOf(category.getIsActive())));
        }

        return results;
    }

    private GlobalSearchResult result(
            String id,
            String label,
            String description,
            String path,
            String category,
            String extraKeywords) {
        String safeLabel = label == null || label.isBlank() ? "Không có tiêu đề" : label;
        String safeDescription = description == null ? "" : description;
        String keywords = join(safeLabel, safeDescription, path, category, extraKeywords);

        return GlobalSearchResult.builder()
                .id(id)
                .label(safeLabel)
                .description(safeDescription)
                .path(path)
                .category(category)
                .keywords(keywords)
                .build();
    }

    private static String join(String... parts) {
        return String.join(" ", Arrays.stream(parts)
                .filter(part -> part != null && !part.isBlank())
                .toList());
    }

    private static String normalize(String value) {
        if (value == null) {
            return "";
        }
        String decomposed = Normalizer.normalize(value, Normalizer.Form.NFD);
        return decomposed
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }
}
