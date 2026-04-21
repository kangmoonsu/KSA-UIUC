package com.core.ksa.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ExecutiveMemberRequestDto {
    private String name;
    private String position;
    private String period;
    private String major;
    private String imageUrl;
    private String email;
    @JsonProperty("isCurrent")
    private boolean isCurrent;
    private Integer displayOrder;
}
