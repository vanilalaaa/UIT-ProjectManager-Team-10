package com.example.se330.repository;

import com.example.se330.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUid(String uid);

    Optional<User> findByEmail(String email);

    Optional<User> findByVerificationToken(String token);

    Optional<User> findByResetPasswordToken(String token);

    boolean existsByUid(String uid);

    boolean existsByEmail(String email);

    Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String name,
            String email,
            Pageable pageable);
}
