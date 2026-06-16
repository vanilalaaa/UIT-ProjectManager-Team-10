package com.example.se330.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Tệp tài liệu yêu cầu đồ án do giảng viên tải lên cho 1 lớp (SV xem/tải).
@Entity
@Table(name = "requirement_files")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequirementFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "requirement_file_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    private String label;

    @Column(columnDefinition = "TEXT")
    private String url;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
