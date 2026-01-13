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

        public static UserProfileResponse from(User user) {
            return UserProfileResponse.builder()
                    .email(user.getEmail())
                    .name(user.getName())
                    .nickname(user.getName())
                    .role(user.getRole().name())
                    .profileImageUrl(user.getProfileImageUrl())
                    .build();
        }
    }

    @Data
    public static class UpdateNicknameRequest {
        private String nickname;
    }
}
