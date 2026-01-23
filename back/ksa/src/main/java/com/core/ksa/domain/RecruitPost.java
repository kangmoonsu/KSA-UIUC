package com.core.ksa.domain;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecruitPost extends Post {

    @Column(nullable = false)
    private String companyName;

    @ElementCollection
    @CollectionTable(name = "recruit_post_roles", joinColumns = @JoinColumn(name = "recruit_post_id"))
    @Column(name = "role")
    private List<String> roles = new ArrayList<>();

    private String salary; // e.g., "$60k - $80k" or "$20/hr"

    @Column(nullable = false)
    private String location;

    private String employmentType; // Full-time, Part-time, Intern, etc.

    private LocalDateTime deadline; // Application deadline

    private String experienceLevel; // Junior, Senior, etc.

    private String applicationUrl; // External link for application

    @Builder
    public RecruitPost(String title, String content, User author, String companyName, List<String> roles,
            String salary, String location, String employmentType, LocalDateTime deadline,
            String experienceLevel, String applicationUrl) {
        super(title, content, author);
        this.companyName = companyName;
        this.roles = roles != null ? roles : new ArrayList<>();
        this.salary = salary;
        this.location = location;
        this.employmentType = employmentType;
        this.deadline = deadline;
        this.experienceLevel = experienceLevel;
        this.applicationUrl = applicationUrl;
    }
}
