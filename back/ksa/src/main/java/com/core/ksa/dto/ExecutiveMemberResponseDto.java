package com.core.ksa.dto;

import com.core.ksa.domain.ExecutiveMember;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

@Getter
public class ExecutiveMemberResponseDto {
    private Long id;
    private String name;
    private String position;
    private String period;
    private String major;
    private String imageUrl;
    private String email;
    @JsonProperty("isCurrent")
    private boolean isCurrent;
    private Integer displayOrder;

    public ExecutiveMemberResponseDto(ExecutiveMember member) {
        this.id = member.getId();
        this.name = member.getName();
        this.position = member.getPosition();
        this.period = member.getPeriod();
        this.major = member.getMajor();
        this.imageUrl = member.getImageUrl();
        this.email = member.getEmail();
        this.isCurrent = member.isCurrent();
        this.displayOrder = member.getDisplayOrder();
    }
}
