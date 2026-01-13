package com.core.ksa.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class JobPostCreateRequestDto {
    private String title;
    private String content;
    private String salary;
    private String location;
    private String contactInfo;
    private String status;
}
