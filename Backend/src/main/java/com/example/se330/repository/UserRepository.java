package com.example.se330.repository;

import com.example.se330.entity.Project;
import com.example.se330.entity.User;
import com.example.se330.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

        Optional<User> findByUid(String uid);

        Optional<User> findByEmail(String email);

        Optional<User> findByVerificationToken(String token);

        Optional<User> findByResetPasswordToken(String token);

        boolean existsByUid(String uid);

        boolean existsByEmail(String email);

        Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        String name,
                        String email,
                        Pageable pageable);

        @Query("SELECT u FROM User u WHERE " +
                        "(:role IS NULL OR u.role = :role) AND " +
                        "(:search IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
        Page<User> searchUsers(@Param("role") Role role, @Param("search") String search, Pageable pageable);

        @Query("SELECT p FROM Project p " +
                        "JOIN p.registrations rp " + // Link sang RegisterProject
                        "JOIN rp.group g " + // Link sang Group
                        "JOIN g.members gm " + // Link sang GroupMember
                        "JOIN gm.user u " + // Link sang User
                        // Chỉ thành viên ACTIVE mới truy cập được đồ án của nhóm; INVITED/PENDING thì chưa.
                        "WHERE u = :user AND gm.status = com.example.se330.enums.GroupMemberStatus.ACTIVE")
        List<Project> findProjectsByUser(@Param("user") User user);
}
