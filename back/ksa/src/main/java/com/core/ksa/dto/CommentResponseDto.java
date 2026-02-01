package com.core.ksa.dto;

import com.core.ksa.domain.Comment;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
public class CommentResponseDto {
    private Long id;
    private String content;
    private String authorName;
    private String authorProfileImage;
    private String authorClerkId;
    private LocalDateTime createdAt;
    private boolean isSecret;
    private boolean isDeleted;
    private List<CommentResponseDto> children = new ArrayList<>();

    public CommentResponseDto(Comment comment) {
        this.id = comment.getId();
        this.content = comment.getContent();
        this.authorName = comment.getAuthor().getName(); // or Nickname
        this.authorProfileImage = comment.getAuthor().getProfileImageUrl();
        this.authorClerkId = comment.getAuthor().getClerkId();
        this.createdAt = comment.getCreatedAt();
        this.isSecret = comment.isSecret();
        this.isDeleted = comment.isDeleted();
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void addChild(CommentResponseDto child) {
        this.children.add(child);
    }
}
