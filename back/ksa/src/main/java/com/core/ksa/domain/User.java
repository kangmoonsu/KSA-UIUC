package com.core.ksa.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String clerkId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String nickname;

    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private UserBan currentBan;

    public boolean isBanned() {
        return currentBan != null && !currentBan.isExpired();
    }

    public String getBanReason() {
        return currentBan != null ? currentBan.getReason() : null;
    }

    public enum Role {
        USER, ADMIN, MASTER
    }

    @Builder
    public User(String clerkId, String email, String name, String nickname, String profileImageUrl, Role role) {
        this.clerkId = clerkId;
        this.email = email;
        this.name = name;
        this.nickname = nickname;
        this.profileImageUrl = profileImageUrl;
        this.role = role != null ? role : Role.USER;
    }

    public void updateProfile(String name, String profileImageUrl) {
        this.name = name;
        this.profileImageUrl = profileImageUrl;
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void ban(String reason, java.time.LocalDateTime expiresAt) {
        this.currentBan = UserBan.builder()
                .user(this)
                .reason(reason)
                .expiresAt(expiresAt)
                .build();
    }

    public void unban() {
        this.currentBan = null;
    }
}
