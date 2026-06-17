package com.example.se330.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Gắn tiền tố /api cho TẤT CẢ controller (1 chỗ duy nhất) để mọi endpoint đồng
// nhất dưới /api. Controller không khai báo /api trong @RequestMapping nữa.
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.addPathPrefix("/api",
                cls -> cls.getPackageName().startsWith("com.example.se330.controller"));
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path cwd = Paths.get("").toAbsolutePath().normalize();
        boolean runningFromBackend = cwd.getFileName() != null
                && "Backend".equalsIgnoreCase(cwd.getFileName().toString());
        Path backendUploadDir = (runningFromBackend ? cwd : cwd.resolve("Backend"))
                .resolve("uploads")
                .normalize();
        Path legacyUploadDir = (runningFromBackend && cwd.getParent() != null ? cwd.getParent() : cwd)
                .resolve("uploads")
                .normalize();

        registry.addResourceHandler("/files/**")
                .addResourceLocations(
                        backendUploadDir.toUri().toString(),
                        legacyUploadDir.toUri().toString()
                );
    }
}
