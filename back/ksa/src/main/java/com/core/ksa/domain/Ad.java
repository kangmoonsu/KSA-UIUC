package com.core.ksa.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "ads")
public class Ad extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String imageUrl;

    @Column(nullable = false)
    private String targetUrl;

    @Column(nullable = false)
    private Integer orderIndex;

    private boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User creator;

    @Builder
    public Ad(String imageUrl, String targetUrl, Integer orderIndex, boolean isActive, User creator) {
        this.imageUrl = imageUrl;
        this.targetUrl = targetUrl;
        this.orderIndex = orderIndex;
        this.isActive = isActive;
        this.creator = creator;
    }
}
