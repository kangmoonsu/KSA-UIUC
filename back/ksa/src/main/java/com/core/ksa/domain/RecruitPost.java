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

    // Deprecated fields kept db column but removed from usage
    // private String salary;
    // private String employmentType;
    // private LocalDateTime deadline;
    // private String experienceLevel;
    // private String applicationUrl;

    @ElementCollection
    @CollectionTable(name = "recruit_post_links", joinColumns = @JoinColumn(name = "recruit_post_id"))
    @Column(name = "link_url")
    private List<String> applicationLinks = new ArrayList<>();

    @Builder
    public RecruitPost(String title, String content, User author, String companyName, List<String> roles,
            List<String> applicationLinks) {
        super(title, content, author);
        this.companyName = companyName;
        this.roles = roles != null ? roles : new ArrayList<>();
        this.applicationLinks = applicationLinks != null ? applicationLinks : new ArrayList<>();
    }
}
