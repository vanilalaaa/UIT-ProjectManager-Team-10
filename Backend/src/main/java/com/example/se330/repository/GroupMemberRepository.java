package com.example.se330.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.se330.entity.GroupMember;
import com.example.se330.enums.GroupMemberStatus;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    void deleteByGroupId(Long groupId);

    // Tìm kiếm thành viên cụ thể trong nhóm
    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);

    // Kiểm tra xem user đã có nhóm nào được DUYỆT (APPROVED) trong Course này chưa
    boolean existsByUserIdAndGroupCourseIdAndStatus(Long userId, Long courseId, GroupMemberStatus status);

    // Tìm các thành viên theo Group ID và Trạng thái (ví dụ: PENDING)
    List<GroupMember> findByGroupIdAndStatus(Long groupId, GroupMemberStatus status);

    Optional<GroupMember> findByUserId(Long userId);

    // Nhóm của 1 user trong 1 lớp cụ thể (để dựng bảng Kanban theo đồ án).
    Optional<GroupMember> findFirstByUser_IdAndGroup_Course_Id(Long userId, Long courseId);

}
