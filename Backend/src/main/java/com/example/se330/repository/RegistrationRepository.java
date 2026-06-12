package com.example.se330.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.se330.entity.Registration;
import com.example.se330.enums.RegistrationStatus;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    // Nhóm đang nhận 1 đề tài = registration APPROVED của project.
    Optional<Registration> findFirstByProject_IdAndStatus(Long projectId, RegistrationStatus status);

    // Yêu cầu đăng ký theo lớp + trạng thái (GV duyệt các yêu cầu PENDING).
    List<Registration> findByProject_Course_IdAndStatus(Long courseId, RegistrationStatus status);

    // Chặn đề xuất trùng khi nhóm đã có đề tài/đề xuất đang chờ duyệt hoặc đã duyệt.
    boolean existsByGroup_IdAndStatusIn(Long groupId, Collection<RegistrationStatus> statuses);
}
