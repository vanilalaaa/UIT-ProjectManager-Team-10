package com.example.se330.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.example.se330.dto.ApiResponse;

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
                FieldError fieldError = ex.getBindingResult().getFieldErrors().get(0);

                String fieldName = fieldError.getField();
                String errorMessage = fieldError.getDefaultMessage();
                errors.put(fieldName, null);

                return ApiResponse.error(
                                HttpStatus.BAD_REQUEST,
                                errorMessage,
                                "400");
        }

        // Tệp tĩnh không tồn tại (vd /files/...) → 404, không để lọt xuống handler 500.
        @ExceptionHandler(NoResourceFoundException.class)
        public ResponseEntity<ApiResponse<Void>> handleNoResource(NoResourceFoundException ex) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên.");
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
