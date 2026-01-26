package com.core.ksa.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.data.domain.Page;

@Getter
@AllArgsConstructor
public class ConsultingPostListResponseDto {
    private Page<ConsultingPostResponseDto> posts;
}
