package com.core.ksa.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ExecutiveMember extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String position; // e.g., President, Vice President

    @Column(nullable = false)
    private String period; // e.g., 2024-2025

    private String major;
    private String imageUrl;
    private String email;

    private boolean isCurrent;

    private Integer displayOrder;

    @Builder
    public ExecutiveMember(String name, String position, String period, String major, String imageUrl, String email,
            boolean isCurrent, Integer displayOrder) {
        this.name = name;
        this.position = position;
        this.period = period;
        this.major = major;
        this.imageUrl = imageUrl;
        this.email = email;
        this.isCurrent = isCurrent;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }

    public void update(String name, String position, String period, String major, String imageUrl, String email,
            boolean isCurrent, Integer displayOrder) {
        this.name = name;
        this.position = position;
        this.period = period;
        this.major = major;
        this.imageUrl = imageUrl;
        this.email = email;
        this.isCurrent = isCurrent;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }
}
