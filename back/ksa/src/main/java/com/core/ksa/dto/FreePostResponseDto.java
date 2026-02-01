package com.core.ksa.dto;

import com.core.ksa.domain.FreePost;
import lombok.Getter;

@Getter
public class FreePostResponseDto {
    private Long id;
    private String title;
    private String content;
    private String author;
    private String authorClerkId;
    private boolean isNotice;
    private int viewCount;
    private int commentCount;
    private boolean commentEnabled;
    private String createdAt;

    public FreePostResponseDto(FreePost post) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.content = post.getContent();
        this.author = post.getAuthor().getNickname() != null ? post.getAuthor().getNickname()
                : post.getAuthor().getName();
        this.authorClerkId = post.getAuthor().getClerkId();
        this.isNotice = post.isNotice();
        this.viewCount = post.getViewCount();
        this.commentCount = post.getCommentCount();
        this.commentEnabled = post.isCommentEnabled();
        this.createdAt = post.getCreatedAt().toString();
    }
}
