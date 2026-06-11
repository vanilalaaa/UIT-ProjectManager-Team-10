package com.example.se330.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.se330.dto.CategoryDto;
import com.example.se330.dto.admin.AdminCreateCategoryRequest;
import com.example.se330.dto.admin.AdminUpdateCategoryRequest;
import com.example.se330.dto.admin.AdminUpdateCategoryStatusRequest;
import com.example.se330.entity.Category;
import com.example.se330.repository.CategoryRepository;

@Service
public class AdminCategoryService {
    private final CategoryRepository categoryRepository;

    public AdminCategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDto> listActiveCategories() {
        return categoryRepository.findByIsActiveTrue()
                .stream()
                .map(this::toCategoryDto)
                .toList();
    }

    public Page<CategoryDto> listCategories(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));

        Page<Category> categories;
        if (search == null || search.isBlank()) {
            categories = categoryRepository.findAll(pageable);
        } else {
            categories = categoryRepository.findByNameContainingIgnoreCase(search, pageable);
        }

        return categories.map(this::toCategoryDto);
    }

    public CategoryDto createCategory(AdminCreateCategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Category name already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isActive(true)
                .build();

        Category saved = categoryRepository.save(category);
        return toCategoryDto(saved);
    }

    public CategoryDto updateCategory(Long id, AdminUpdateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            if (categoryRepository.existsByName(request.getName())) {
                throw new IllegalArgumentException("Category name already exists");
            }
            category.setName(request.getName());
        }

        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }

        Category updated = categoryRepository.save(category);
        return toCategoryDto(updated);
    }

    public CategoryDto updateCategoryStatus(Long id, AdminUpdateCategoryStatusRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        category.setIsActive(request.getIsActive());
        Category updated = categoryRepository.save(category);
        return toCategoryDto(updated);
    }

    public CategoryDto getCategoryDto(Long id) {
        Category category = this.getCategoryById(id);
        return toCategoryDto(category);
    }

    public Category getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        return category;
    }

    private CategoryDto toCategoryDto(Category category) {
        return CategoryDto.builder()
                .categoryId(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .isActive(category.getIsActive())
                .build();
    }
}
