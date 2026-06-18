package com.example.se330.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Điểm + nhận xét cho 1 tiêu chí (barem) trong 1 lần chấm điểm (Grade).
// Snapshot tên & thang điểm của tiêu chí tại thời điểm chấm để vẫn hiển thị
// đúng kể cả khi giảng viên sửa lại barem sau này.
@Entity
@Table(name = "grade_criterion_scores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeCriterionScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grade_id")
    private Grade grade;

    @Column(name = "criterion_id")
    private Long criterionId;

    @Column(name = "criterion_name")
    private String criterionName;

    @Column(name = "max_score", precision = 6, scale = 2)
    private BigDecimal maxScore;

    @Column(precision = 6, scale = 2)
    private BigDecimal score;

    @Column(length = 1000)
    private String note;
}
