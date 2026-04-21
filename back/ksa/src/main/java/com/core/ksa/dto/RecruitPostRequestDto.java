package com.core.ksa.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class RecruitPostRequestDto {
    private String title;
    private String content;
    private String companyName;
    private List<String> roles;
    private List<String> applicationLinks = new ArrayList<>();
    private List<String> locations = new ArrayList<>();
}
