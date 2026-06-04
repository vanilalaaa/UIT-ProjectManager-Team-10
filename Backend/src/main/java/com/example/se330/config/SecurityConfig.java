package com.example.se330.config;

import com.example.se330.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.authentication.AuthenticationProvider;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Thay thế cho EnableGlobalMethodSecurity đã bị deprecated
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Sử dụng Lambda DSL cho CSRF
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Cấu hình quyền truy cập (Dùng requestMatchers trực tiếp, không cần
                // AntPathRequestMatcher)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password",
                                "/api/auth/verify-email",
                                "/api/auth/resend-verification")
                        .permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        .requestMatchers("/api/admin/**")
                        .hasAuthority("ADMIN")

                         // TASK MODULE APIs
                        .requestMatchers(
                                "/api/projects/*/tasks/**",
                                "/api/tasks/**"
                        )
                        .hasAnyRole("STUDENT", "TEACHER", "ADMIN")
                        
                        .requestMatchers(
                                "/api/projects/*/submissions",
                                "/api/submissions/**"
                        )
                        .hasAnyRole("STUDENT", "TEACHER", "ADMIN")
                        .anyRequest().authenticated())

                // 3. Cấu hình Session Stateless cho JWT
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Thiết lập Provider
                .authenticationProvider(authenticationProvider())

                // 5. Thêm Filter JWT trước UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}