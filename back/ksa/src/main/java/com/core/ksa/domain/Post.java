package com.core.ksa.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "dtype")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public abstract class Post extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    private int viewCount;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private int commentCount = 0;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean commentEnabled = true;

    protected Post(String title, String content, User author) {
        this(title, content, author, true);
    }

    protected Post(String title, String content, User author, boolean commentEnabled) {
        this.title = title;
        this.content = content;
        this.author = author;
        this.viewCount = 0;
        this.commentCount = 0;
        this.commentEnabled = commentEnabled;
    }
}
