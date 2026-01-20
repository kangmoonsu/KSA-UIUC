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
public class FreePost extends Post {

    private boolean isNotice;

    @Builder
    public FreePost(String title, String content, User author, boolean isNotice) {
        super(title, content, author);
        this.isNotice = isNotice;
    }
}
