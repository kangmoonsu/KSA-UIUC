package com.core.ksa.domain;

import jakarta.persistence.Entity;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NewsPost extends Post {

    @Builder
    public NewsPost(String title, String content, User author) {
        super(title, content, author);
    }
}
