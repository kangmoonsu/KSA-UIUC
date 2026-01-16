package com.core.ksa.dto;

import com.core.ksa.domain.User;
import lombok.Builder;
import lombok.Data;

public class UserDto {

    @Data
    public static class SyncRequest {
        private String clerkId;
        private String email;
        private String name;
        private String profileImageUrl;
    }

    @Data
    @Builder
    public static class UserProfileResponse {
        private String email;
        private String name;
        private String nickname;
        private String role;
        private String profileImageUrl;
        private boolean banned;

        public static UserProfileResponse from(User user) {
            return UserProfileResponse.builder()
                    .email(user.getEmail())
                    .name(user.getName())
                    .nickname(user.getNickname() != null ? user.getNickname() : user.getName())
                    .role(user.getRole().name())
                    .profileImageUrl(user.getProfileImageUrl())
                    .banned(user.isBanned())
                    .build();
        }
    }

    @Data
    public static class UpdateNicknameRequest {
        private String nickname;
    }

    @Data
    @Builder
    public static class UserAdminResponse {
        private String clerkId;
        private String email;
        private String name;
        private String nickname;
        private String role;
        private boolean banned;
        private java.time.LocalDateTime createdAt;
        private java.time.LocalDateTime banExpiresAt;

        public static UserAdminResponse from(User user) {
            return UserAdminResponse.builder()
                    .clerkId(user.getClerkId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .nickname(user.getNickname())
                    .role(user.getRole().name())
                    .banned(user.isBanned())
                    .createdAt(user.getCreatedAt())
                    .banExpiresAt(user.isBanned() ? user.getCurrentBan().getExpiresAt() : null)
                    .build();
        }
    }

    @Data
    @Builder
    public static class UserDetailResponse {
        private String clerkId;
        private String email;
        private String name;
        private String nickname;
        private String role;
        private boolean banned;
        private String banReason;
        private java.time.LocalDateTime banExpiresAt;
        private String profileImageUrl;
        private java.util.List<MyPostResponseDto> posts;
        private java.util.List<UserActionLogResponse> logs;

        public static UserDetailResponse from(User user, java.util.List<MyPostResponseDto> posts,
                java.util.List<UserActionLogResponse> logs) {
            return UserDetailResponse.builder()
                    .clerkId(user.getClerkId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .nickname(user.getNickname())
                    .role(user.getRole().name())
                    .banned(user.isBanned())
                    .banReason(user.isBanned() ? user.getBanReason() : null)
                    .banExpiresAt(user.isBanned() ? user.getCurrentBan().getExpiresAt() : null)
                    .profileImageUrl(user.getProfileImageUrl())
                    .posts(posts)
                    .logs(logs)
                    .build();
        }
    }

    @Data
    @Builder
    public static class UserActionLogResponse {
        private String actionType;
        private String description;
        private String actorName;
        private java.time.LocalDateTime createdAt;

        public static UserActionLogResponse from(com.core.ksa.domain.UserActionLog log) {
            return UserActionLogResponse.builder()
                    .actionType(log.getActionType().name())
                    .description(log.getDescription())
                    .actorName(log.getActorName())
                    .createdAt(log.getCreatedAt())
                    .build();
        }
    }

    @Data
    public static class BanRequest {
        private String reason;
        private java.time.LocalDateTime expiresAt;
    }
}
