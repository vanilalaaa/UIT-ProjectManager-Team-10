package com.example.se330.repository;

import com.example.se330.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Page<Category> findByNameContainingIgnoreCase(String name, Pageable pageable);

    boolean existsByName(String name);
}
