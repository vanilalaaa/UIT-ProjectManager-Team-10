package com.example.se330.repository;

import com.example.se330.entity.Task;
import com.example.se330.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository
        extends JpaRepository<Task, Long> {

    List<Task> findByProject_Id(Long projectId);

    List<Task> findByProject_IdAndStatus(
            Long projectId,
            TaskStatus status
    );

    List<Task> findByProject_IdAndAssignedTo_Id(
            Long projectId,
            Long assigneeId
    );

    List<Task> findByProject_IdAndAssignedTo_IdAndStatus(
            Long projectId,
            Long assigneeId,
            TaskStatus status
    );

    List<Task> findByAssignedTo_Id(Long assigneeId);

    List<Task> findByAssignedTo_IdAndStatus(Long assigneeId, TaskStatus status);

    List<Task> findByCreatedBy_Id(Long creatorId);
}