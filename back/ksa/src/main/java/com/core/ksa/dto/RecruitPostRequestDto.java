package com.core.ksa.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class RecruitPostRequestDto {
    private String title;
    private String content;
    private String companyName;
    private List<String> roles;
    private String salary;
    private String location;
    private String employmentType;
    private LocalDateTime deadline;
    private String experienceLevel;
    private String applicationUrl;
}
