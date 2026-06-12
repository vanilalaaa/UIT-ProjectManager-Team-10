package com.example.se330.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.se330.enums.GroupMemberStatus;

@Entity
@Table(name = "group_members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_member_id")
    private Long groupMemberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "joined_date")
    private LocalDate joinedDate;

    // Thời điểm bản ghi được tạo (gửi yêu cầu / được mời) — dùng cho thông báo có
    // giờ chính xác. joinedDate chỉ là ngày nên không hiển thị đúng "x phút trước".
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private GroupMemberStatus status;

    @Column(name = "is_leader")
    @Builder.Default
    private Boolean isLeader = false;
}
