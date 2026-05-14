package com.example.se330.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.se330.dto.UserDto;
import com.example.se330.dto.auth.AuthResponse;
import com.example.se330.dto.auth.ChangePasswordRequest;
import com.example.se330.dto.auth.LoginRequest;
import com.example.se330.dto.auth.RegisterRequest;
import com.example.se330.dto.auth.ResetPasswordRequest;
import com.example.se330.entity.User;
import com.example.se330.repository.UserRepository;
import com.example.se330.security.JwtService;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            EmailService emailService,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        // 1. Kiểm tra logic nghiệp vụ
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // 2. Tạo dữ liệu
        String uid = UUID.randomUUID().toString();
        String verificationToken = jwtService.generateVerificationToken(request.getEmail());

        System.out.println("Verification token: " + verificationToken);

        User user = User.builder()
                .uid(uid)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .isActive(false)
                .verificationToken(verificationToken)
                .verificationTokenExpiry(LocalDateTime.now().plusHours(24))
                .build();

        // 3. Thực hiện hành động
        userRepository.save(user);
        emailService.sendVerificationEmail(request.getEmail(), verificationToken);

        // 4. Trả về DTO thuần túy
        return AuthResponse.builder()
                .uid(uid)
                .email(request.getEmail())
                .name(request.getName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // 1. Kiểm tra user tồn tại
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // 2. Kiểm tra account đã verify chưa
        if (!user.getIsActive()) {

            String verificationToken = jwtService.generateVerificationToken(user.getEmail());

            user.setVerificationToken(verificationToken);
            user.setVerificationTokenExpiry(
                    LocalDateTime.now().plusHours(24));

            userRepository.save(user);

            emailService.sendVerificationEmail(
                    user.getEmail(),
                    verificationToken);

            throw new RuntimeException(
                    "Account not verified. Verification email sent again.");
        }

        // 3. Authenticate password
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        // 4. Generate JWT
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        String token = jwtService.generateToken(userDetails);

        // 5. Return response
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime())
                .uid(user.getUid())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
    }

    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));

        if (user.getVerificationTokenExpiry()
                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException("Verification token has expired");
        }

        user.setIsActive(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);

        userRepository.save(user);
    }

    public void resendVerification(String email) {

        User user = userRepository.findByEmail(email)
                .orElse(null);
        if (user == null) {
            return;
        }

        if (user.getIsActive()) {
            throw new RuntimeException(
                    "Account is already verified");
        }

        String verificationToken = jwtService.generateVerificationToken(email);

        user.setVerificationToken(verificationToken);

        user.setVerificationTokenExpiry(
                LocalDateTime.now().plusHours(24));

        userRepository.save(user);

        emailService.sendVerificationEmail(
                email,
                verificationToken);
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElse(null);
        if (user == null) {
            return;
        }

        String resetToken = jwtService.generateResetPasswordToken(email);

        user.setResetPasswordToken(resetToken);

        user.setResetPasswordTokenExpiry(
                LocalDateTime.now().plusHours(1));

        userRepository.save(user);

        emailService.sendPasswordResetEmail(
                email,
                resetToken);
    }

    public void resetPassword(ResetPasswordRequest request) {

        User user = userRepository
                .findByResetPasswordToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (user.getResetPasswordTokenExpiry()
                .isBefore(LocalDateTime.now())) {

            throw new RuntimeException(
                    "Reset token has expired");
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()));

        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);

        userRepository.save(user);
    }

    public void changePassword(
            Authentication authentication,
            ChangePasswordRequest request) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public UserDto updateCurrentUser(
            Authentication authentication,
            com.example.se330.dto.auth.UpdateUserRequest request) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!request.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email is already in use");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return UserDto.builder()
                .id(user.getUserId())
                .uid(user.getUid())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
    }

    public UserDto getCurrentUser(
            Authentication authentication) {
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserDto.builder()
                .id(user.getUserId())
                .uid(user.getUid())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
    }
}
