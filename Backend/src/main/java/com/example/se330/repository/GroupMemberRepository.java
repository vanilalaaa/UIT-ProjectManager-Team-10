package com.example.se330.repository;

import java.util.Collection;
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

    // Đã "dính" nhóm trong lớp ở bất kỳ trạng thái nào (ACTIVE/INVITED/PENDING) —
    // dùng để loại khỏi danh sách có thể mời (tránh mời lại người đã mời/đang chờ).
    boolean existsByUser_IdAndGroup_Course_IdAndStatusIn(
            Long userId, Long courseId, Collection<GroupMemberStatus> statuses);

    // Tìm các thành viên theo Group ID và Trạng thái (ví dụ: PENDING)
    List<GroupMember> findByGroupIdAndStatus(Long groupId, GroupMemberStatus status);

    Optional<GroupMember> findByUserId(Long userId);

    // Nhóm CHÍNH THỨC của user trong lớp — chỉ tính thành viên ACTIVE. INVITED/PENDING
    // chưa phải là "nhóm của tôi" (tránh đếm lời mời chưa nhận / yêu cầu chưa duyệt).
    Optional<GroupMember> findFirstByUser_IdAndGroup_Course_IdAndStatus(
            Long userId, Long courseId, GroupMemberStatus status);

    // Lời mời của 1 user (status INVITED) để SV xem/chấp nhận.
    List<GroupMember> findByUser_IdAndStatus(Long userId, GroupMemberStatus status);

}
