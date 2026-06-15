package com.example.se330.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.se330.entity.Group;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    // Tìm Group theo ID và Course ID để đảm bảo Group thuộc về Course đó
    Optional<Group> findByIdAndCourseId(Long groupId, Long courseId);

    // Tìm tất cả Group theo Course ID
    List<Group> findByCourseId(Long courseId);

    // Các nhóm mà user đang là Trưởng nhóm (để gom thông báo "xin vào nhóm").
    List<Group> findByLeader_Id(Long leaderId);
}
