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
    private Long writerId;
    private String writerClerkId;
    private String createdAt;
    private String type;
    private List<FleaItemDto> items;

    public static FleaPostResponseDto from(MarketPost post, List<FleaItemDto> items) {
        return FleaPostResponseDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .location(post.getContactPlace())
                .writer(post.getAuthor() != null
                        ? (post.getAuthor().getNickname() != null ? post.getAuthor().getNickname()
                                : post.getAuthor().getName())
                        : "Unknown")
                .writerId(post.getAuthor() != null ? post.getAuthor().getId() : null)
                .writerClerkId(post.getAuthor() != null ? post.getAuthor().getClerkId() : null)
                .createdAt(post.getCreatedAt() != null ? post.getCreatedAt().toString() : "")
                .type(post.getType() != null ? post.getType().name() : "SELL")
                .items(items)
                .build();
    }
}
