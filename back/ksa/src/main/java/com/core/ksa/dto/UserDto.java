package com.core.ksa.dto;

import com.core.ksa.domain.User;
import com.core.ksa.domain.UserActionLog;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

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
        private Long id;
        private String clerkId;
        private String email;
        private String name;
        private String nickname;
        private String profileImageUrl;
        private String role;
        private boolean isBanned;
        private LocalDateTime banExpiresAt;

        public static UserProfileResponse from(User user) {
            return UserProfileResponse.builder()
                    .id(user.getId())
                    .clerkId(user.getClerkId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .nickname(user.getNickname())
                    .profileImageUrl(user.getProfileImageUrl())
                    .role(user.getRole().name())
                    .isBanned(user.isBanned())
                    .banExpiresAt(user.getCurrentBan() != null ? user.getCurrentBan().getExpiresAt() : null)
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
        private Long id;
        private String clerkId;
        private String email;
        private String name;
        private String nickname;
        private String role;
        private boolean isBanned;
        private LocalDateTime banExpiresAt;
        private LocalDateTime createdAt;

        public static UserAdminResponse from(User user) {
            return UserAdminResponse.builder()
                    .id(user.getId())
                    .clerkId(user.getClerkId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .nickname(user.getNickname())
                    .role(user.getRole().name())
                    .isBanned(user.isBanned())
                    .banExpiresAt(user.getCurrentBan() != null ? user.getCurrentBan().getExpiresAt() : null)
                    .createdAt(user.getCreatedAt())
                    .build();
        }
    }

    @Data
    @Builder
    public static class UserDetailResponse {
        private UserAdminResponse user;
        private List<MyPostResponseDto> posts;
        private List<UserActionLogResponse> logs;

        public static UserDetailResponse from(User user, List<MyPostResponseDto> posts,
                List<UserActionLogResponse> logs) {
            return UserDetailResponse.builder()
                    .user(UserAdminResponse.from(user))
                    .posts(posts)
                    .logs(logs)
                    .build();
        }
    }

    @Data
    public static class BanRequest {
        private String reason;
        private LocalDateTime expiresAt;
    }

    @Data
    @Builder
    public static class UserActionLogResponse {
        private Long id;
        private String actionType;
        private String description;
        private String actorName;
        private LocalDateTime createdAt;

        public static UserActionLogResponse from(UserActionLog log) {
            return UserActionLogResponse.builder()
                    .id(log.getId())
                    .actionType(log.getActionType().name())
                    .description(log.getDescription())
                    .actorName(log.getActorName())
                    .createdAt(log.getCreatedAt())
                    .build();
        }
    }
}
