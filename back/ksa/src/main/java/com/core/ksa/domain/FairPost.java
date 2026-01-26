package com.core.ksa.domain;

import jakarta.persistence.Entity;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FairPost extends Post {

    private LocalDateTime eventDate; // Date of the session/consulting
    private String location;

    @Builder
    public FairPost(String title, String content, User author, LocalDateTime eventDate, String location) {
        super(title, content, author);
        this.eventDate = eventDate;
        this.location = location;
    }
}
