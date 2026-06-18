package com.example.se330.repository;

import com.example.se330.entity.PasswordResetOTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface PasswordResetOTPRepository
        extends JpaRepository<PasswordResetOTP, Long> {

    Optional<PasswordResetOTP> findByEmail(String email);

    Optional<PasswordResetOTP> findByEmailAndOtp(
            String email,
            String otp
    );

    @Modifying
    @Transactional
    void deleteByEmail(String email);
}
