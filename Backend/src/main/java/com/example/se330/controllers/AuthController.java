package com.example.se330.controllers;

import com.example.se330.dto.AuthResponse;
import com.example.se330.services.FirebaseAuthService;
import com.google.firebase.auth.FirebaseToken;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final FirebaseAuthService firebaseAuthService;

    @PostMapping("/verify")
    public ResponseEntity<AuthResponse> verifyToken(
            @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(
                new AuthResponse(null, null, null, "Missing or invalid Authorization header")
            );
        }

        try {
            String token = authHeader.replace("Bearer ", "");
            FirebaseToken firebaseToken = firebaseAuthService.verifyToken(token);

            AuthResponse response = new AuthResponse(
                firebaseToken.getUid(),
                firebaseToken.getEmail(),
                firebaseToken.getName(),
                "Token valid"
            );
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(
                new AuthResponse(null, null, null, "Invalid token")
            );
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(
            @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(
                new AuthResponse(null, null, null, "Missing or invalid Authorization header")
            );
        }

        try {
            String token = authHeader.replace("Bearer ", "");
            FirebaseToken firebaseToken = firebaseAuthService.verifyToken(token);

            return ResponseEntity.ok(new AuthResponse(
                firebaseToken.getUid(),
                firebaseToken.getEmail(),
                firebaseToken.getName(),
                "Success"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(
                new AuthResponse(null, null, null, "Invalid token")
            );
        }
    }
}
