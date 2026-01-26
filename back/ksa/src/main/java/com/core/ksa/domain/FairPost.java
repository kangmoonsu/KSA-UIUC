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
public class ConsultingPost extends Post {

    private LocalDateTime eventDate; // Date of the session/consulting

    private String location; // Physical or Virtual location

    @Builder
    public ConsultingPost(String title, String content, User author, LocalDateTime eventDate, String location) {
        super(title, content, author);
        this.eventDate = eventDate;
        this.location = location;
    }
}
