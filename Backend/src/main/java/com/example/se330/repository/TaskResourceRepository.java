package com.example.se330.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.se330.entity.TaskResource;

@Repository
public interface TaskResourceRepository extends JpaRepository<TaskResource, Long> {

    List<TaskResource> findByTask_IdOrderByIdDesc(Long taskId);
}
