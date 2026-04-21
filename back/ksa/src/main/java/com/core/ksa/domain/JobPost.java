package com.core.ksa.domain;

import jakarta.persistence.Entity;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JobPost extends Post {

    private String salary; // Text format like "$15/hr"
    private String location;
    private String contactInfo;
    private String itemStatus; // HIRING, CLOSED

    // No images for Jobs as per requirements

    @Builder
    public JobPost(String title, String content, User author, String salary, String location, String contactInfo,
            String itemStatus) {
        super(title, content, author);
        this.salary = salary;
        this.location = location;
        this.contactInfo = contactInfo;
        this.itemStatus = itemStatus != null ? itemStatus : "HIRING";
    }
}
