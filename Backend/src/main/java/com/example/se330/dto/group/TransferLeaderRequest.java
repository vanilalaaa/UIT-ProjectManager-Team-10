package com.example.se330.dto.group;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferLeaderRequest {
    private Long newLeaderId; // ID của thành viên mới sẽ trở thành Trưởng nhóm
}
