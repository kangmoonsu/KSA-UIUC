package com.core.ksa.dto;

import com.core.ksa.domain.NewsPost;
import lombok.Getter;

@Getter
public class NewsPostResponseDto {
    private Long id;
    private String title;
    private String content;
    private String author;
    private String authorClerkId;
    private int viewCount;
    private String createdAt;

    public NewsPostResponseDto(NewsPost post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.author = post.getAuthor().getNickname() != null ? post.getAuthor().getNickname()
                : post.getAuthor().getName();
        this.authorClerkId = post.getAuthor().getClerkId();
        this.viewCount = post.getViewCount();
        this.createdAt = post.getCreatedAt().toString();
    }
}
