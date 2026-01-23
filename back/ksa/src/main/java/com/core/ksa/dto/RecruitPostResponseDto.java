package com.core.ksa.dto;

import com.core.ksa.domain.RecruitPost;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class RecruitPostResponseDto {
    private Long id;
    private String title;
    private String content;

    // Flattened User fields to match JobPostResponseDto pattern
    private String writer;
    private Long writerId;
    private String writerClerkId;

    private int viewCount;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;

    private String companyName;
    private List<String> roles;
    private String salary;
    private String location;
    private String employmentType;
    private LocalDateTime deadline;
    private String experienceLevel;
    private String applicationUrl;

    public RecruitPostResponseDto(RecruitPost entity) {
        this.id = entity.getId();
        this.title = entity.getTitle();
        this.content = entity.getContent();

        // Handle Author
        if (entity.getAuthor() != null) {
            this.writer = entity.getAuthor().getNickname() != null ? entity.getAuthor().getNickname()
                    : entity.getAuthor().getName();
            this.writerId = entity.getAuthor().getId();
            this.writerClerkId = entity.getAuthor().getClerkId();
        } else {
            this.writer = "Unknown";
        }

        this.viewCount = entity.getViewCount();
        this.createdDate = entity.getCreatedAt();
        this.modifiedDate = entity.getUpdatedAt();

        this.companyName = entity.getCompanyName();
        this.roles = entity.getRoles() != null ? new java.util.ArrayList<>(entity.getRoles()) : null;
        this.salary = entity.getSalary();
        this.location = entity.getLocation();
        this.employmentType = entity.getEmploymentType();
        this.deadline = entity.getDeadline();
        this.experienceLevel = entity.getExperienceLevel();
        this.applicationUrl = entity.getApplicationUrl();
    }
}
