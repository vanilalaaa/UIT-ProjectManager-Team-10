package com.example.se330.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.se330.entity.ProjectResource;

@Repository
public interface ProjectResourceRepository extends JpaRepository<ProjectResource, Long> {

    List<ProjectResource> findByProject_IdOrderByIdDesc(Long projectId);
}
