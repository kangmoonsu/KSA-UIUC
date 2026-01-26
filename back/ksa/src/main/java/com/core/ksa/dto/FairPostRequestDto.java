package com.core.ksa.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class ConsultingPostRequestDto {
    private String title;
    private String content;
    private LocalDateTime eventDate;
    private String location;
}
