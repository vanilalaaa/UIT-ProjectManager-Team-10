package com.example.se330.controller;

import com.example.se330.dto.*;
import com.example.se330.dto.auth.AuthResponse;
import com.example.se330.dto.auth.ForgotPasswordRequest;
import com.example.se330.dto.auth.LoginRequest;
import com.example.se330.dto.auth.RegisterRequest;
import com.example.se330.dto.auth.ResetPasswordRequest;
import com.example.se330.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {
    private final AuthService authService;

    public AuthController(
            AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse resp = this.authService.register(request);
        return ApiResponse.success(resp, "Registration successful. Please check your email to verify your account.");
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse resp = this.authService.login(request);
        return ApiResponse.success(resp, "Login successful");
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ApiResponse.success("Logout successful");
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam String token) {
        this.authService.verifyEmail(token);
        return ApiResponse.success("Email verified successfully");
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(
            @RequestParam String email) {
        authService.resendVerification(email);

        return ApiResponse.success("Verification email sent");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());

        return ApiResponse.success("If the email exists, a password reset link has been sent");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request);

        return ApiResponse.success("Password reset successful");
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(
            Authentication authentication) {

        UserDto userDto = authService.getCurrentUser(authentication);

        return ApiResponse.success(
                userDto,
                "User retrieved successfully");
    }
}
