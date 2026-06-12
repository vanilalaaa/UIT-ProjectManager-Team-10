package com.example.se330.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.se330.entity.Registration;
import com.example.se330.enums.RegistrationStatus;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    // Nhóm đang nhận 1 đề tài = registration APPROVED của project.
    Optional<Registration> findFirstByProject_IdAndStatus(Long projectId, RegistrationStatus status);
}
