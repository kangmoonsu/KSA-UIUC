package com.core.ksa.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CommentRequestDto {
    private String content;
    private Long parentId;
    private boolean isSecret;
}
