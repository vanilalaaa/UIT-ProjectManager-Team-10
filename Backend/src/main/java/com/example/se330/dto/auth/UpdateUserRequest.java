package com.example.se330.dto.auth;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    private String name;

    @Email(message = "Email must be valid")
    
    private String email;
    private String firstName;
    private String lastName;
    private String summary;
    private String avatarUrl;
}
