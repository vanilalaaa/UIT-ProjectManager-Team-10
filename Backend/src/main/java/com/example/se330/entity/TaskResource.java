package com.example.se330.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Tài nguyên đính kèm của task: liên kết (GitHub/Drive/Link) hoặc tệp tải lên (PDF, DOCX, ...).
@Entity
@Table(name = "task_resources")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_resource_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    // FILE | DRIVE | GITHUB | LINK
    private String type;

    private String label;

    @Column(columnDefinition = "TEXT")
    private String url;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
