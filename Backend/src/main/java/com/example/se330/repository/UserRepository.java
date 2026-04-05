package com.example.se330.repository;

import com.example.se330.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUid(String uid);

    Optional<User> findByEmail(String email);

    boolean existsByUid(String uid);

    boolean existsByEmail(String email);
}
