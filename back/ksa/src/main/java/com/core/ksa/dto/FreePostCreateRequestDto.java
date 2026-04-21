package com.core.ksa.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FreePostCreateRequestDto {
    private String title;
    private String content;
    private boolean isNotice;
    private boolean commentEnabled;
}
