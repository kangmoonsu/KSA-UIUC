package com.core.ksa.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Greeting extends BaseEntity {

    @Id
    private Long id = 1L; // We only need one record

    @Column(columnDefinition = "TEXT")
    private String content;

    public Greeting(String content) {
        this.content = content;
    }

    public void update(String content) {
        this.content = content;
    }
}
