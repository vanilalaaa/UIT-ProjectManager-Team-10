package com.example.se330.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

// Một yêu cầu nộp bài trong yêu cầu đồ án, ví dụ: báo cáo PDF, source code ZIP.
@Entity
@Table(name = "requirement_submission_requirements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequirementSubmissionRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "submission_requirement_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requirement_id")
    private Requirement requirement;

    @Column(name = "content", length = 500)
    private String content;

    @Column(name = "order_index")
    private Integer orderIndex;

    @OneToMany(mappedBy = "submissionRequirement", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<RequirementFile> files = new ArrayList<>();
}
