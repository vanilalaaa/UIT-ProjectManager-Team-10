// dto/AuthResponse.java
package com.example.se330.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String uid;
    private String email;
    private String name;
    private String message;
}