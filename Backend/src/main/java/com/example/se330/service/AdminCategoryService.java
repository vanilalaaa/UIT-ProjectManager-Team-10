package com.example.se330.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.se330.dto.CategoryDto;
import com.example.se330.entity.Category;
import com.example.se330.repository.CategoryRepository;

@Service
public class AdminCategoryService {
    private final CategoryRepository categoryRepository;

    public AdminCategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public Page<CategoryDto> listCategories(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "categoryId"));

        Page<Category> categories;
        if (search == null || search.isBlank()) {
            categories = categoryRepository.findAll(pageable);
        } else {
            categories = categoryRepository.findByNameContainingIgnoreCase(search, pageable);
        }

        return categories.map(this::toCategoryDto);
    }

    private CategoryDto toCategoryDto(Category category) {
        return CategoryDto.builder()
                .categoryId(category.getCategoryId())
                .name(category.getName())
                .description(category.getDescription())
                .isActive(category.getIsActive())
                .build();
    }
}
