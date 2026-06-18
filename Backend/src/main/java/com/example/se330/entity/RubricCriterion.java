package com.example.se330.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

// Một tiêu chí trong barem chấm điểm (VD: "Thiết kế UI/UX" / 10đ).
@Entity
@Table(name = "rubric_criteria")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RubricCriterion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "criterion_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requirement_id")
    private Requirement requirement;

    @Column(nullable = false)
    private String name;

    @Column(name = "max_score", precision = 6, scale = 2)
    private BigDecimal maxScore;

    @Column(name = "order_index")
    private Integer orderIndex;

    @OneToMany(mappedBy = "criterion", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<RequirementFile> files = new ArrayList<>();
}
