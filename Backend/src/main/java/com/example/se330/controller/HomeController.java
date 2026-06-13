package com.example.se330.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.se330.dto.ApiResponse;
import com.example.se330.dto.home.FeedItemResponse;
import com.example.se330.dto.home.HomeStatsResponse;
import com.example.se330.security.CustomUserDetails;
import com.example.se330.service.HomeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/home")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    // GET /home/feed - feed hoạt động/thay đổi gần đây
    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<FeedItemResponse>>> getFeed(
            Authentication authentication,
            @RequestParam(defaultValue = "20") int limit) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<FeedItemResponse> resp = homeService.getFeed(userDetails.getId(), limit);
        return ApiResponse.success(resp, "Lấy feed hoạt động thành công.");
    }

    // GET /home/stats - dữ liệu thống kê cho biểu đồ
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<HomeStatsResponse>> getStats(Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        HomeStatsResponse resp = homeService.getStats(userDetails.getId());
        return ApiResponse.success(resp, "Lấy thống kê thành công.");
    }
}
