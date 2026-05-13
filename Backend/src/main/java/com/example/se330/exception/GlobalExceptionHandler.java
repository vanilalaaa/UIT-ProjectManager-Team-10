package com.example.se330.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.se330.dto.ApiResponse;

import lombok.var;

@RestControllerAdvice
public class GlobalExceptionHandler {
        // 1. Xử lý sai thông tin đăng nhập (Email/Password)
        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ApiResponse<Void>> handleBadCredentials(
                        BadCredentialsException ex) {

                return ApiResponse.error(
                                HttpStatus.UNAUTHORIZED,
                                "Invalid email or password");
        }

        // 2. Xử lý tài khoản chưa verify (Custom Exception bạn tạo)
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
                        MethodArgumentNotValidException ex) {

                Map<String, Object> errors = new HashMap<>();
                var fieldError = ex.getBindingResult().getFieldErrors().get(0);

                String fieldName = fieldError.getField();
                String errorMessage = fieldError.getDefaultMessage();
                errors.put(fieldName, null);

                return ApiResponse.error(
                                HttpStatus.BAD_REQUEST,
                                errorMessage,
                                "400");
        }

        // 3. Xử lý RuntimeException
        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<ApiResponse<Void>> handleRuntimeException(
                        RuntimeException ex) {

                return ApiResponse.error(
                                HttpStatus.BAD_REQUEST,
                                ex.getMessage());
        }

        // 4. Xử lý lỗi hệ thống (500)
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiResponse<Void>> handleGeneralException(
                        Exception ex) {

                return ApiResponse.error(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "An unexpected error occurred");
        }
}
