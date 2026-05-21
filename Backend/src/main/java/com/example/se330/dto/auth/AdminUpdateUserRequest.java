package com.example.se330.dto.auth;

import com.example.se330.enums.Role;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUpdateUserRequest {

    private String name;

    @Email(message = "Email must be valid")
    private String email;

    private Role role;
}
