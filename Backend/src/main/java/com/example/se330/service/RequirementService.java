package com.example.se330.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.se330.dto.requirement.RequirementResponse;
import com.example.se330.dto.requirement.RubricCriterionRequest;
import com.example.se330.dto.requirement.RubricCriterionResponse;
import com.example.se330.dto.requirement.SaveRequirementRequest;
import com.example.se330.entity.Category;
import com.example.se330.entity.Course;
import com.example.se330.entity.Project;
import com.example.se330.entity.Requirement;
import com.example.se330.entity.RubricCriterion;
import com.example.se330.repository.CategoryRepository;
import com.example.se330.repository.CourseRepository;
import com.example.se330.repository.ProjectRepository;
import com.example.se330.repository.RequirementRepository;

@Service
@Transactional
public class RequirementService {

    private final RequirementRepository requirementRepository;
    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final ProjectRepository projectRepository; 

    public RequirementService(
            RequirementRepository requirementRepository,
            CourseRepository courseRepository,
            CategoryRepository categoryRepository,
            ProjectRepository projectRepository) { 
        this.requirementRepository = requirementRepository;
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    public RequirementResponse getRequirement(Long courseId) {
        return this.requirementRepository.findByCourse_Id(courseId)
                .map(this::toResponse)
                .orElseGet(RequirementService::emptyResponse);
    }

    public RequirementResponse saveRequirement(Long courseId, SaveRequirementRequest req, Long teacherId) {
        Course course = this.courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));

        if (course.getLecturer() == null || !course.getLecturer().getId().equals(teacherId)) {
            throw new RuntimeException("Bạn không phải giảng viên của lớp học này");
        }

        Requirement requirement = this.requirementRepository.findByCourse_Id(courseId)
                .orElseGet(() -> Requirement.builder().course(course).build());

        Category category = null;
        if (req.getCategoryId() != null) {
            category = this.categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy loại đồ án"));
        }
        requirement.setCategory(category);
        requirement.setDescription(req.getDescription());
        
        LocalDate newDeadline = parseDate(req.getDeadline());
        requirement.setDeadline(newDeadline);

        requirement.getCriteria().clear();
        List<RubricCriterionRequest> incoming = req.getCriteria() != null ? req.getCriteria() : List.of();
        int order = 0;
        for (RubricCriterionRequest c : incoming) {
            requirement.getCriteria().add(RubricCriterion.builder()
                    .requirement(requirement)
                    .name(c.getName())
                    .maxScore(c.getMaxScore())
                    .orderIndex(order++)
                    .build());
        }

        Requirement savedReq = this.requirementRepository.save(requirement);

        if (newDeadline != null) {
            List<Project> projects = projectRepository.findByCourse(course);
            if (projects != null && !projects.isEmpty()) {
                for (Project p : projects) {
                    p.setEndDate(newDeadline);
                }
                projectRepository.saveAll(projects);
            }
        }

        return toResponse(savedReq);
    }

    private static LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        try { return LocalDate.parse(value); } 
        catch (Exception e) { return null; }
    }

    private RequirementResponse toResponse(Requirement r) {
        Category cat = r.getCategory();
        List<RubricCriterionResponse> criteria = r.getCriteria().stream()
                .map(c -> RubricCriterionResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .maxScore(c.getMaxScore())
                        .build())
                .toList();

        return RequirementResponse.builder()
                .categoryId(cat != null ? cat.getId() : null)
                .categoryName(cat != null ? cat.getName() : "")
                .description(r.getDescription() != null ? r.getDescription() : "")
                .deadline(r.getDeadline() != null ? r.getDeadline().toString() : "")
                .criteria(criteria)
                .build();
    }

    private static RequirementResponse emptyResponse() {
        return RequirementResponse.builder().categoryId(null).categoryName("").description("").deadline("").criteria(List.of()).build();
    }
}