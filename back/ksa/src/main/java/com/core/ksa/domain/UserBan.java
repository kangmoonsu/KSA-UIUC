package com.core.ksa.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "user_bans")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserBan extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String reason;

    private LocalDateTime bannedAt;

    private LocalDateTime expiresAt; // null means permanent

    @Builder
    public UserBan(User user, String reason, LocalDateTime bannedAt, LocalDateTime expiresAt) {
        this.user = user;
        this.reason = reason;
        this.bannedAt = bannedAt != null ? bannedAt : LocalDateTime.now();
        this.expiresAt = expiresAt;
    }

    public boolean isPermanent() {
        return expiresAt == null;
    }

    public boolean isExpired() {
        if (expiresAt == null)
            return false;
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
