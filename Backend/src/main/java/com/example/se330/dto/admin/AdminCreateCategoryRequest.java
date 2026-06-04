package com.example.se330.dto.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCreateCategoryRequest {
    @NotBlank(message = "Category name is required")
    private String name;
    
    private String description;
}
