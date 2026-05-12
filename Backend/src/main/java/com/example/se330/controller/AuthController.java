package com.example.se330.controller;

import com.example.se330.dto.*;
import com.example.se330.entity.User;
import com.example.se330.repository.UserRepository;
import com.example.se330.service.EmailService;
import com.example.se330.service.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder,
                          JwtService jwtService, AuthenticationManager authenticationManager,
                          EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Email already registered"));
        }

        String uid = UUID.randomUUID().toString();
        String verificationToken = jwtService.generateVerificationToken(request.getEmail());

        User user = User.builder()
                .uid(uid)
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .isActive(false)
                .verificationToken(verificationToken)
                .verificationTokenExpiry(LocalDateTime.now().plusHours(24))
                .build();

        userRepository.save(user);
        emailService.sendVerificationEmail(request.getEmail(), verificationToken);

        AuthResponse response = AuthResponse.builder()
                .uid(uid)
                .email(request.getEmail())
                .name(request.getName())
                .message("Registration successful. Please check your email to verify your account.")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.<AuthResponse>success("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

                User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
                java.util.Objects.requireNonNull(user, "User must not be null");

            if (!user.getIsActive()) {
                String verificationToken = jwtService.generateVerificationToken(request.getEmail());
                user.setVerificationToken(verificationToken);
                user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
                userRepository.save(user);
                emailService.sendVerificationEmail(request.getEmail(), verificationToken);

                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.<AuthResponse>error("Account not verified. A new verification email has been sent."));
            }

            org.springframework.security.core.userdetails.UserDetails userDetails = 
                    (org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails);

            AuthResponse response = AuthResponse.builder()
                    .accessToken(token)
                    .tokenType("Bearer")
                    .expiresIn(jwtService.getExpirationTime())
                    .uid(user.getUid())
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole().name())
                    .message("Login successful")
                    .build();

            return ResponseEntity.ok(ApiResponse.<AuthResponse>success("Login successful", response));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid email or password"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logout successful"));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
        User user = userRepository.findByVerificationToken(token)
            .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid verification token"));
        }

        if (user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Verification token has expired"));
        }

        user.setIsActive(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Email verified successfully"));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(@RequestParam String email) {
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.ok(ApiResponse.success("If the email exists, a verification link has been sent"));
        }

        if (user.getIsActive()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Account is already verified"));
        }

        String verificationToken = jwtService.generateVerificationToken(email);
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        emailService.sendVerificationEmail(email, verificationToken);

        return ResponseEntity.ok(ApiResponse.success("Verification email sent"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return ResponseEntity.ok(ApiResponse.success("If the email exists, a reset link has been sent"));
        }

        String resetToken = jwtService.generateResetPasswordToken(request.getEmail());
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(request.getEmail(), resetToken);

        return ResponseEntity.ok(ApiResponse.success("If the email exists, a password reset link has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        User user = userRepository.findByResetPasswordToken(request.getToken())
            .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid reset token"));
        }

        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Reset token has expired"));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Password reset successful"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        java.util.Objects.requireNonNull(user, "User must not be null");

        UserDto userDto = UserDto.builder()
                .id(user.getUserId())
                .uid(user.getUid())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .build();

        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", userDto));
    }
}
