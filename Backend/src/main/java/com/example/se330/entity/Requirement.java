package com.example.se330.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

// Yêu cầu đồ án của 1 lớp: loại đồ án (category) + mô tả + hạn nộp chung +
// barem tiêu chí chấm điểm. Mỗi lớp có tối đa 1 yêu cầu (OneToOne với Course).
@Entity
@Table(name = "requirements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Requirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "requirement_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", unique = true)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(length = 2000)
    private String description;

    private LocalDate deadline;

    @OneToMany(mappedBy = "requirement", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<RequirementSubmissionRequirement> submissionRequirements = new ArrayList<>();

    @OneToMany(mappedBy = "requirement", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<RubricCriterion> criteria = new ArrayList<>();
}
