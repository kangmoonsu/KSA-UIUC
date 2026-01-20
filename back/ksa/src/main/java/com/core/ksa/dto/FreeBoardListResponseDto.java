package com.core.ksa.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;
import java.util.List;

@Getter
@AllArgsConstructor
public class FreeBoardListResponseDto {
    private List<FreePostResponseDto> notices;
    private Page<FreePostResponseDto> posts;
}
