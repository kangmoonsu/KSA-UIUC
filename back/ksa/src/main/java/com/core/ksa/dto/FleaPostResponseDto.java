package com.core.ksa.dto;

import com.core.ksa.domain.MarketPost;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class FleaPostResponseDto {
    private Long id;
    private String title;
    private String content;
    private String location;
    private String writer;
    private String createdAt;
    private List<FleaItemDto> items;

    public static FleaPostResponseDto from(MarketPost post, List<FleaItemDto> items) {
        return FleaPostResponseDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .location(post.getContactPlace())
                .writer(post.getAuthor() != null ? post.getAuthor().getName() : "Unknown")
                .createdAt(post.getCreatedAt() != null ? post.getCreatedAt().toString() : "")
                .items(items)
                .build();
    }
}
