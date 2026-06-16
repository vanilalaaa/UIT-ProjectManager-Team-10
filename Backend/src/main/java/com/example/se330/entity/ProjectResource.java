package com.example.se330.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Tài nguyên dùng chung của nhóm trong 1 đồ án: liên kết (GitHub/Drive/Link) hoặc tệp tải lên.
@Entity
@Table(name = "project_resources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_resource_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    // FILE | DRIVE | GITHUB | LINK (khớp ResourceType ở FE)
    private String type;

    private String label;

    @Column(columnDefinition = "TEXT")
    private String url;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
