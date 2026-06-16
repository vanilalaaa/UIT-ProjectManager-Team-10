package com.example.se330.dto.search;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalSearchResult {
    private String id;
    private String label;
    private String description;
    private String path;
    private String category;
    private String keywords;
}
