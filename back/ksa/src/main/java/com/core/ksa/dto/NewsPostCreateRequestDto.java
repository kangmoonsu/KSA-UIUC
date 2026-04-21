package com.core.ksa.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class NewsPostCreateRequestDto {
    private String title;
    private String content;
}
